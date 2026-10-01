/**
 * Ponto de entrada da aplicação.
 * Importa os módulos, inicia os componentes globais e registra as rotas da SPA.
 */
import { iniciarRoteador } from './router.js';
import { iniciarMenu, iniciarModais, iniciarAtalhoConteudo } from './modules/interface.js';
import { paginaInicio } from './pages/inicio.js';
import { paginaProjetos } from './pages/projetos.js';
import { paginaCadastro } from './pages/cadastro.js';
import { paginaPainel } from './pages/painel.js';
import { paginaNaoEncontrada } from './pages/nao-encontrada.js';

// Indica ao CSS que o JavaScript está ativo (o menu só é recolhido com JS)
document.documentElement.classList.add('js');

iniciarAtalhoConteudo();
iniciarMenu();
iniciarModais();

iniciarRoteador({
    elemento: document.getElementById('app'),
    paginas: {
        inicio: paginaInicio,
        projetos: paginaProjetos,
        cadastro: paginaCadastro,
        painel: paginaPainel
    },
    inicial: paginaInicio,
    naoEncontrada: paginaNaoEncontrada
});
