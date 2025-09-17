export class CnabWriter {
  private linhas: string[] = [];
  lote = 0;
  seqNoLote = 0;

  private registrosPorLote = new Map<number, number>();
  private somaValoresPorLote = new Map<number, number>(); // em centavos

  add(line: string, opts?: { countInLote?: boolean }) {
    this.linhas.push(line);

    const shouldCount = opts?.countInLote ?? true;
    if (this.lote > 0 && shouldCount) {
      this.registrosPorLote.set(
        this.lote,
        (this.registrosPorLote.get(this.lote) ?? 0) + 1
      );
    }
  }

  nextLote() {
    this.lote += 1;
    this.seqNoLote = 0;
    this.registrosPorLote.set(this.lote, 0);
    this.somaValoresPorLote.set(this.lote, 0);
  }

  nextSeq() {
    this.seqNoLote += 1;
    return this.seqNoLote;
  }

  addValorAtual(valorCentavos: number) {
    if (this.lote > 0) {
      const prev = this.somaValoresPorLote.get(this.lote) ?? 0;
      this.somaValoresPorLote.set(this.lote, prev + valorCentavos);
    }
  }

  getLinhas() { return this.linhas.slice(); }
  getQtdRegistrosDoLote(lote: number) { return this.registrosPorLote.get(lote) ?? 0; }
  getSomaValoresDoLote(lote: number) { return this.somaValoresPorLote.get(lote) ?? 0; }
}