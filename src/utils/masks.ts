const masks = {
  cpfMask: (cpf: string): string =>
    cpf
      /* substitui qualquer caracter que nao seja numero por nada */
      .replace(/\D/g, '')
      /* captura 2 grupos de numero o primeiro de 3 e o segundo de 1, apos
      capturar o primeiro grupo ele adiciona um ponto antes do segundo
      grupo de numero */
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      /* captura 2 numeros seguidos de um traço e não deixa ser digitado mais nada */
      .replace(/(-\d{2})\d+?$/, '$1'),
  phoneMask: (phone: string): string =>
    phone
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d)(\d{4})$/, '$1-$2')
}

export default masks
