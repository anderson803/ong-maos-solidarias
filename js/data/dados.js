/**
 * Dados da aplicação.
 * Em um sistema real, estas informações viriam de uma API (back-end).
 * Aqui ficam em um módulo separado para que os templates sejam gerados
 * a partir dos dados, e não escritos manualmente no HTML.
 */

export const projetos = [
    {
        id: 'cozinha-solidaria',
        titulo: 'Cozinha Solidária',
        artigo: 'a',
        categoria: 'Alimentação',
        variante: '',
        imagem: '../imagens/projetos/cozinha-solidaria.jpg',
        alt: 'Panela sobre o fogo e pratos de comida servidos sobre uma mesa',
        resumo: 'Preparo e distribuição de refeições para famílias da comunidade.',
        descricao: 'Preparo e distribuição de refeições nutritivas para famílias da comunidade.',
        publico: 'Famílias em situação de insegurança alimentar.',
        participacao: 'Doação de alimentos ou apoio no preparo aos sábados.'
    },
    {
        id: 'aprender-juntos',
        titulo: 'Aprender Juntos',
        artigo: 'o',
        categoria: 'Educação',
        variante: 'info',
        imagem: '../imagens/projetos/aprender-juntos.jpg',
        alt: 'Quadro-negro, livros coloridos e uma criança comemorando',
        resumo: 'Reforço escolar e oficinas de leitura para crianças e adolescentes.',
        descricao: 'Reforço escolar e oficinas de leitura no contraturno das aulas.',
        publico: 'Crianças e adolescentes de 6 a 14 anos.',
        participacao: 'Voluntariado como educador ou doação de material escolar.'
    },
    {
        id: 'conecta-comunidade',
        titulo: 'Conecta Comunidade',
        artigo: 'o',
        categoria: 'Inclusão digital',
        variante: 'aviso',
        imagem: '../imagens/projetos/conecta-comunidade.jpg',
        alt: 'Duas pessoas usando computadores portáteis conectados à internet sem fio',
        resumo: 'Aulas de informática básica e inclusão digital para adultos e idosos.',
        descricao: 'Aulas de informática básica, uso seguro da internet e serviços digitais.',
        publico: 'Adultos e idosos com pouco acesso à tecnologia.',
        participacao: 'Voluntariado como instrutor ou doação de equipamentos em bom estado.'
    }
];

export const indicadores = [
    { numero: '1.200', texto: 'refeições distribuídas por mês' },
    { numero: '350', texto: 'crianças atendidas no reforço escolar' },
    { numero: '80', texto: 'voluntários ativos' }
];

export const formasParticipacao = {
    voluntariado: 'Voluntariado',
    doacao: 'Doação',
    ambos: 'Voluntariado e doação'
};

export const estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
    'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];
