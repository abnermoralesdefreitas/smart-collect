export function generateDemoPortfolio(count = 50) {
  const firstNames = [
    "Mariana","Carlos","Fernanda","Rafael","Julia","Bruno","Camila","Diego","Larissa","Pedro",
    "Ana","Lucas","Beatriz","Gustavo","Amanda","João","Paula","Felipe","Renata","Thiago",
  ];
  const lastNames = ["Silva","Santos","Oliveira","Souza","Lima","Pereira","Costa","Rodrigues","Almeida","Nascimento"];

  const operadores = ["Abner", "João", "Larissa"];
  const statuses = ["Em aberto", "Negociação", "Promessa", "Sem contato", "Pago"];

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  const toCPF = () => {
    const n = () => randInt(0, 9);
    return `${n()}${n()}${n()}.${n()}${n()}${n()}.${n()}${n()}${n()}-${n()}${n()}`;
  };

  const rows = Array.from({ length: count }).map((_, idx) => {
    const nome = `${pick(firstNames)} ${pick(lastNames)}`;
    const dias = randInt(0, 120);
    const valor = Math.round((randInt(80, 15000) + Math.random()) * 100) / 100;

    const historicoRand = Math.random();
    const historico = historicoRand > 0.75 ? "ruim" : historicoRand > 0.35 ? "medio" : "bom";

    const status = dias === 0 ? "Pago" : pick(statuses);
    const operador = pick(operadores);

    const tentativas = status === "Pago" ? randInt(0, 2) : randInt(0, 5);
    const semContatoDias = status === "Pago" ? 0 : randInt(0, 14);

    return {
      id: idx + 1,
      nome,
      cpf: toCPF(),
      dias,
      valor,
      historico,
      reincidente: Math.random() > 0.7,
      tentativas,
      status,
      operador,
      semContatoDias,
      historicoContatos: [],
    };
  });

  return rows;
}
