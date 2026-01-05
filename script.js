// CONFIGURAÇÃO SUPABASE
const SUPABASE_URL = "https://ddwlsisctmjqmhbajzmj.supabase.co";
const SUPABASE_KEY = "sb_publishable_X95ZSTtfoLiKm1oUPhXIUw_eSO4Kf6P";
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("grid-bolinhas");
  const inputs = {
    nome: document.getElementById("nome"),
    data_inicio: document.getElementById("dataInicio"),
    salario: document.getElementById("salario"),
    valor_guardado: document.getElementById("valorGuardado"),
  };
  const metaInput = document.getElementById("metaPatrimonio");

  // Cria as 300 bolinhas
  for (let i = 0; i < 300; i++) {
    const div = document.createElement("div");
    div.classList.add("bolinha");
    grid.appendChild(div);
  }
  const bolinhas = document.querySelectorAll(".bolinha");

  // FUNÇÃO: Buscar dados do Banco
  async function carregarDadosDoBanco() {
    const { data, error } = await _supabase
        .from('progresso_salarios')
        .select('*')
        .eq('id', 1);

    if (data && data.length > 0) {
        const registro = data[0];
        
        // Preenche os campos de texto e número
        inputs.nome.value = registro.nome || '';
        inputs.salario.value = registro.salario || 0;
        inputs.valor_guardado.value = registro.valor_guardado || 0;

        // --- TRATAMENTO DA DATA ---
        if (registro.data_inicio) {
            // O split("T")[0] pega apenas a parte "2026-01-05" da string do banco
            const dataFormatada = registro.data_inicio.split("T")[0];
            inputs.data_inicio.value = dataFormatada;
        }

        atualizarInterface();
    }
}

  // FUNÇÃO: Salvar dados no Banco (com Debounce para não sobrecarregar)
  let timeoutSalvar;
  const statusDot = document.getElementById("status-dot");
  const statusText = document.getElementById("status-text");

  function setStatus(state) {
    statusDot.classList.remove("saving", "error");
    if (state === "saving") {
      statusDot.classList.add("saving");
      statusText.innerText = "Salvando...";
    } else if (state === "synced") {
      statusText.innerText = "Sincronizado";
    } else if (state === "error") {
      statusDot.classList.add("error");
      statusText.innerText = "Erro ao salvar";
    }
  }

  function salvarComAtraso() {
    setStatus("saving"); // Ativa o modo "Laranja"
    clearTimeout(timeoutSalvar);
    timeoutSalvar = setTimeout(async () => {
      const { error } = await _supabase.from("progresso_salarios").upsert({
        id: 1,
        nome: inputs.nome.value,
        data_inicio: inputs.data_inicio.value,
        salario: parseFloat(inputs.salario.value) || 0,
        valor_guardado: parseFloat(inputs.valor_guardado.value) || 0,
      });

      if (error) {
        console.error(error);
        setStatus("error");
      } else {
        setStatus("synced"); // Volta para o "Verde"
      }
    }, 1000);
  }

  function atualizarInterface() {
    const salario = parseFloat(inputs.salario.value) || 0;
    const guardado = parseFloat(inputs.valor_guardado.value) || 0;
    const meta = salario * 300;

    metaInput.value = meta.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    if (salario > 0) {
      const preencher = Math.floor(guardado / salario);
      bolinhas.forEach((b, i) => {
        i < preencher
          ? b.classList.add("filled")
          : b.classList.remove("filled");
      });
    }
  }

  // Eventos
  Object.values(inputs).forEach((input) => {
    input.addEventListener("input", () => {
      atualizarInterface();
      salvarComAtraso();
    });
  });

  // Início
  carregarDadosDoBanco();
});
