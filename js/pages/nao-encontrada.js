import { html } from '../utils/html.js';
import { cabecalhoPagina } from '../components/componentes.js';

export const paginaNaoEncontrada = {
    titulo: 'Página não encontrada',

    render() {
        return html`
            ${cabecalhoPagina({
                titulo: 'Página não encontrada',
                subtitulo: 'O endereço acessado não existe ou foi alterado.'
            })}
            <div class="secao">
                <div class="container">
                    <a class="botao" href="#/inicio">Voltar para o início</a>
                </div>
            </div>`;
    }
};
