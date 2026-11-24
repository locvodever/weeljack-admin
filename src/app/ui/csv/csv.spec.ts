import { describe, expect, it, vi } from 'vitest';
import { CsvColumn, downloadCsv, toCsv } from './csv';

interface Row {
  readonly name: string;
  readonly note: string;
}

const COLUMNS: readonly CsvColumn<Row>[] = [
  { header: 'Name', value: (row) => row.name },
  { header: 'Note', value: (row) => row.note },
];

function csvOf(note: string): string {
  return toCsv([{ name: 'x', note }], COLUMNS);
}

describe('toCsv', () => {
  it('writes a quoted header row and one CRLF-separated line per row', () => {
    const csv = toCsv(
      [
        { name: 'Ada', note: 'first' },
        { name: 'Bo', note: 'second' },
      ],
      COLUMNS,
    );

    expect(csv).toBe('"Name","Note"\r\n"Ada","first"\r\n"Bo","second"');
  });

  it('writes only the header row for no rows', () => {
    expect(toCsv([], COLUMNS)).toBe('"Name","Note"');
  });

  it('quotes every field, numbers included', () => {
    expect(toCsv([{ n: 7 }], [{ header: 'N', value: (row) => row.n }])).toBe('"N"\r\n"7"');
  });

  it('doubles inner quotes and keeps commas and newlines inside the quotes', () => {
    expect(csvOf('say "hi", then\r\nleave\nnow')).toBe(
      '"Name","Note"\r\n"x","say ""hi"", then\r\nleave\nnow"',
    );
  });

  it.each([
    ['=SUM(A1:A9)', `'=SUM(A1:A9)`],
    ['+1+1', `'+1+1`],
    ['-2+3', `'-2+3`],
    ['@cmd', `'@cmd`],
    ['\tTabbed', `'\tTabbed`],
    ['\rReturn', `'\rReturn`],
  ])('prefixes a single quote to a cell that starts a formula: %j', (note, shown) => {
    expect(csvOf(note)).toBe(`"Name","Note"\r\n"x","${shown}"`);
  });

  it('guards the header cells and the first character only', () => {
    expect(toCsv([], [{ header: '=HEADER', value: () => '' }])).toBe(`"'=HEADER"`);
    expect(csvOf('1=1')).toBe('"Name","Note"\r\n"x","1=1"');
    expect(csvOf(' =SUM(1)')).toBe('"Name","Note"\r\n"x"," =SUM(1)"');
  });

  it('doubles the quotes of a guarded cell too', () => {
    expect(csvOf('=HYPERLINK("http://a")')).toBe(
      `"Name","Note"\r\n"x","'=HYPERLINK(""http://a"")"`,
    );
  });
});

describe('downloadCsv', () => {
  it('clicks a temporary download link for a UTF-8 CSV Blob with a byte-order mark, then revokes the URL', async () => {
    let blob: Blob | undefined;
    vi.spyOn(URL, 'createObjectURL').mockImplementation((source) => {
      blob = source as Blob;
      return 'blob:test-url';
    });
    const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const clicked: { href: string; download: string; attached: boolean }[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      clicked.push({
        href: this.href,
        download: this.download,
        attached: document.body.contains(this),
      });
    });

    vi.useFakeTimers({ toFake: ['setTimeout'] }); // spec-timing: the revoke is deferred; step the fake clock instead of waiting
    try {
      downloadCsv('tickets.csv', '"A"\r\n"é"');

      expect(clicked).toEqual([{ href: 'blob:test-url', download: 'tickets.csv', attached: true }]);
      expect(revoke).not.toHaveBeenCalled();
      vi.runAllTimers();
      expect(revoke).toHaveBeenCalledExactlyOnceWith('blob:test-url');
    } finally {
      vi.useRealTimers();
    }
    expect(document.querySelector('a[download]')).toBeNull();
    expect(blob?.type).toBe('text/csv;charset=utf-8');
    const bytes = new Uint8Array((await blob?.arrayBuffer()) ?? new ArrayBuffer(0));
    expect(Array.from(bytes.slice(0, 3))).toEqual([0xef, 0xbb, 0xbf]);
    expect(new TextDecoder().decode(bytes.slice(3))).toBe('"A"\r\n"é"');
  });
});
