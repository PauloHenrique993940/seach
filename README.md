# Radar Empresas

Aplicação em português para encontrar empresas **sem site cadastrado** no OpenStreetMap e exibir telefone, e-mail e endereço públicos. Busca por município e segmento, filtro de contatos, favoritos locais e exportação CSV. Não usa dados fictícios nem scraping de Google Maps.

## Desenvolvimento

Node.js 24, sem dependências externas. Execute `npm run dev` e abra http://localhost:3000. Testes: `npm test` (no PowerShell use `npm.cmd` se scripts estiverem bloqueados).

## Vercel

Publique a raiz como projeto com framework **Other**, sem comando de build e sem diretório de saída. `api/search.js` e `api/cities.js` são funções serverless. `vercel.json` define timeout e cabeçalhos de segurança.

## Dados e limites

Municípios: API de Localidades do IBGE. Empresas: Overpass / OpenStreetMap, com município identificado pelo `IBGE:GEOCODIGO` ou `ref:IBGE`. Alguns municípios podem não ter área ou empresas mapeadas. Ausência de site cadastrado não prova ausência de site real. Telefones e e-mails são exibidos somente quando cadastrados. O link de WhatsApp é oferecido somente para números com formato de celular brasileiro; ele não garante conta ativa.

A consulta retorna até 500 registros, com cache de 15 minutos, consultas idênticas agrupadas e intervalo mínimo de 3 segundos por instância. Essas proteções são locais à instância serverless e não representam rate limiting global. Os favoritos ficam neste navegador. Dados são atribuídos aos colaboradores do OpenStreetMap sob ODbL.

O endpoint público Overpass é compartilhado, pode limitar ou interromper consultas e deve ser usado moderadamente. Para uso comercial contínuo ou múltiplos usuários, configure `OVERPASS_URL` na Vercel apontando para uma instância própria ou contratada; consulte https://dev.overpass-api.de/overpass-doc/en/preface/commons.html. Não há armazenamento permanente dos resultados no servidor, autenticação ou CRM nesta versão.

Documentação da fonte: https://wiki.openstreetmap.org/wiki/Overpass_API e https://servicodados.ibge.gov.br/api/docs/localidades.
