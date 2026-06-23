# UI REFERENCE GUIDE
O desenvolvimento da UI deve ser feita em etapas para que erros não aconteçam. Cada etapa desenvolvida deve ser possivel de ser visualizada e testada antes de outra etapa começar. Neste diretório contém screenshots de um protótipo que será usado como referência, não se sinta obrigado a seguir exatamente o que é mostrado aqui, mas este foi o protótipo que o cliente aprovou, então ele espera algo similar. 

## Etapas

### Landing Page

#### Arquivos Referencia:
@screenshots/Sustentabilizar-LandingPage.png 

#### Breve Descrição
É a primeira página que o usuário tem acesso, então deve ter, pelo menos, informações sobre o funcionamento do serviço, botões de entrar/login e cadastro. A UI do protótipo utiliza cores e elementos que remetem à sustentabilidade.

### Criar Conta e Teste Diagnóstico

#### Arquivos Referencia:
@screenshots/Diagnostico-Criar-Conta.png
@screenshots/Diagnostico-Inicial-1.png
@screenshots/Diagnostico-Inicial-2.png
@screenshots/Diagnostico-Inicial-3.png
@screenshots/Diagnostico-Inicial-4.png

#### Breve Descrição
Após completar o cadastro, o usuário é levado para a página de diagnóstico, onde precisa responder algumas perguntas sobre seus hábitos de reciclagem. As respostas são de multipla escolha, podendo variar a quantidade de alternativas. Obs.: As páginas das perguntas não devem ser hardcoded. Deve ser implementado um tipo de banco de perguntas para armazenar as informações das perguntas (como perfil que a pergunta se aplica, respostas, pontuação de cada resposta) e o sistema busca estas informações para construir a pergunta. As informações contidas neste banco de peguntas deve ser possível de ser modificado por um administrador.

### Dashboard

#### Arquivos Referencia:
@screenshots/Diagnostico-Dashboard-Inicio.png
@screenshots/Diagnostico-Dashboard-Registros.png
@screenshots/Diagnostico-Dashboard-Registro-Individual.png
@screenshots/Diagnostico-Dashboard-Novo.png
@screenshots/Diagnostico-Dashboard-Novo-Evidencia.png
@screenshots/Diagnostico-Dashboard-Certificado.png
@screenshots/Diagnostico-Dashboard-Perfil.png

#### Breve Descrição
O dashboard será criado em partes. 

Primeiro será criado a área do menu lateral e área do conteúdo. 

A seguir será populado o menu lateral com o título do serviço, as páginas de nagegação (Início, Registros, Novo, Certificado, Perfil) e na parte de baixo do menu um botão para sair / logoff da conta.

A seguir será implementado página por página, uma página por vez.
##### Inicio
Na página do protótipo, o início contém informações gerais da conta, como nível de certificação, quantidade de registros e resíduos (nos últimos 30 dias e total), uma seção de ações rápidas com botões de novo registro e ver certificados, e uma seção mostrando os últimos registros feitos.
##### Registros
Na página de Regitros contém uma listagem de todos os registros feitos, em ordem cronológica. No card de cada registro é possível ver informações do registro, como data tipo de residuo, peso, volume, quantidade de evidêcias e observações. Também existe no topo informações sobre a quantidade total de registros, um botão para realizar um novo registro e botões para filtrar os registros por tipo de residuo.
##### Registro individual
Ao clicar em qualquer dos registros feitos, é exibida a página de registro individual com informações completas do registro, inclusive visualizar as fotos evidencias anexadas ao registro. Aqui o usuário também poderá adicionar novas evidências ao registro.
##### Novo
Nesta página o usuário realizará um novo registro, e deverá incluir informações deste registro, como tipo de residuo, peso, volume, frequência de coleta, data, observações. Ao completar, ele pode salvar o registro e ir para a página de adicionar evidências.
##### Upload de evidencia
Na página de upload de evidências, o usuário irá fazer o upload de fotos que comprovem o registro. Todas as imagens enviadas devem aparecer apenas na página do registro associado à esta evidência. O timestamp de cada evidência será gerado automaticamente em cada upload. Também deve ter a opção de pular esta etapa.
##### Certificado
Na página de certificado, o usuário poderá visualizar detalhes do seu certificado e pontuação. Deve ver seu nível atual, quanto falta para progregir para o próximo nível, critérios avaliados para progressão de nível e a composição da sua pontuação atual. (Obs. Estas regras de pontuação devem mudar até a implementação final, então faça a implementação desta lógica desacoplada do sistema, de modo que seja fácil alterá-la posteriormente sem interferir no funcionamento do sistema)
##### Perfil
Na página do perfil, deve mostrar infomações cadastrais do usuário e permitir a edição de seus dados cadastrais. Também pode ter algumas estatísticas do perfil. 

