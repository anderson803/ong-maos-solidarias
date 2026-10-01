"""
Servidor HTTP local usado pelos testes.
Sobe em segundo plano, em uma porta livre, servindo a pasta indicada
(a raiz do projeto ou a pasta dist/ gerada pelo build).
"""
import functools
import http.server
import pathlib
import threading

RAIZ = pathlib.Path(__file__).resolve().parent.parent


class _Silencioso(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def iniciar(pasta='.'):
    """Inicia o servidor e devolve (endereço, função para encerrar)."""
    diretorio = (RAIZ / pasta).resolve()
    manipulador = functools.partial(_Silencioso, directory=str(diretorio))
    servidor = http.server.ThreadingHTTPServer(('127.0.0.1', 0), manipulador)
    threading.Thread(target=servidor.serve_forever, daemon=True).start()
    return f'http://127.0.0.1:{servidor.server_address[1]}/', servidor.shutdown
