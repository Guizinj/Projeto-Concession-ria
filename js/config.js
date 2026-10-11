// Configuração pública. Tudo neste arquivo pode ser lido pelo visitante.
export const config = {
  loja: {
    nome: "Vértice Motors",
    descricao: "Uma nova perspectiva para o seu próximo carro.",
    logo: "./assets/images/marca.svg",
    // Preencher com os dados oficiais da concessionária.
    whatsapp: "5581993369736", // Contato informado pelo responsável; DDI + DDD + número.
    endereco: "Rua Visconde de Inhaúma, 451 — Maurício de Nassau, Caruaru — PE, 55012-010",
    localizacaoUrl: "https://share.google/Xnrqm8YwgTy9JIsH1",
    mapaEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3948.2392277670183!2d-35.9742027!3d-8.2789728!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7a98bb8a76fcb0f%3A0xf94781580c588d59!2sDetroit%20Ve%C3%ADculos!5e0!3m2!1spt-BR!2sbr!4v1791663339030!5m2!1spt-BR!2sbr",
    instagramUrl: null,
  },
  supabase: {
    // Somente chave pública publishable; nunca use secret ou service_role.
    url: "https://aazudgnnxgffxxznvjrk.supabase.co",
    publishableKey: "sb_publishable_cGHoxYVHDyBnCXK8j8rbyg_iYX1Y1Q1", // Somente chave pública sb_publishable_…; nunca secret/service_role.
    bucket: "veiculos",
  },
};
