# Kira Queen - Painel de Produtividade Pessoal

Um aplicativo web responsivo e moderno para gerenciamento de produtividade pessoal, inspirado no conceito de organização eficiente.

## 🚀 Funcionalidades

### ✅ Lista de Tarefas Diárias
- **CRUD Completo**: Criar, editar, excluir e marcar tarefas como concluídas
- **Prioridades**: Sistema de prioridades (Alta, Média, Baixa) com cores distintas
- **Datas de Vencimento**: Agendamento de tarefas para datas específicas
- **Interface Intuitiva**: Clique na tarefa para marcar como concluída
- **Persistência**: Todas as tarefas são salvas no localStorage

### 📅 Integração com Calendário
- **Visualização Mensal**: Calendário interativo com navegação por mês
- **Indicadores Visuais**: Pontos verdes indicam dias com tarefas agendadas
- **Clique para Detalhes**: Visualizar tarefas específicas de cada dia
- **Data Atual Destacada**: Destaque visual para o dia atual

### ⏰ Timer Pomodoro
- **Configurável**: Tempos personalizáveis para trabalho e pausa
- **Controles Intuitivos**: Iniciar, pausar e resetar
- **Ciclos Automáticos**: Alternância automática entre trabalho e pausa
- **Notificações**: Alertas ao completar cada ciclo
- **Rastreamento**: Contagem automática de sessões Pomodoro

### 📊 Rastreador de Progresso
- **Estatísticas em Tempo Real**:
  - Tarefas completadas hoje
  - Sessões Pomodoro realizadas hoje
  - Streak atual de produtividade
- **Gráficos Interativos**: Gráfico de linha mostrando progresso dos últimos 7 dias
- **Métricas Duplas**: Tarefas completadas e Pomodoros no mesmo gráfico

## 🎨 Design e Interface

### Características Visuais
- **Design Minimalista**: Interface limpa e focada na produtividade
- **Gradientes Modernos**: Paleta de cores com gradientes suaves
- **Tipografia Elegante**: Fonte Inter para máxima legibilidade
- **Animações Suaves**: Transições e hover effects bem elaborados

### Responsividade
- **Mobile-First**: Otimizado para dispositivos móveis
- **Breakpoints Inteligentes**: Layout adaptativo para diferentes tamanhos de tela
- **Grid Flexível**: Sistema de grid que se reorganiza automaticamente
- **Touch-Friendly**: Botões e elementos otimizados para toque

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Estrutura semântica e acessível
- **CSS3**: Estilos modernos com Grid, Flexbox e animações
- **JavaScript ES6+**: Programação orientada a objetos e funcionalidades avançadas
- **Chart.js**: Biblioteca para criação de gráficos interativos
- **localStorage**: Persistência de dados no navegador
- **Google Fonts**: Tipografia Inter para interface moderna

## 📱 Recursos de Acessibilidade

- **Navegação por Teclado**: Atalhos para funcionalidades principais
- **Contraste Adequado**: Cores com boa legibilidade
- **Foco Visível**: Indicadores claros de elementos focados
- **Texto Alternativo**: Descrições para elementos visuais

## ⌨️ Atalhos de Teclado

- **Escape**: Fechar modal de tarefa
- **Espaço**: Iniciar/pausar timer Pomodoro (quando não em campos de texto)

## 🔧 Como Usar

1. **Abra o arquivo `index.html`** em qualquer navegador moderno
2. **Adicione tarefas** clicando no botão "Nova Tarefa"
3. **Configure o Pomodoro** ajustando os tempos de trabalho e pausa
4. **Visualize seu progresso** no painel de estatísticas e gráficos
5. **Navegue pelo calendário** para ver tarefas agendadas

## 💾 Persistência de Dados

Todos os dados são automaticamente salvos no localStorage do navegador:
- ✅ Lista de tarefas e seu status
- ✅ Sessões Pomodoro completadas
- ✅ Configurações do timer
- ✅ Histórico de produtividade

Os dados persistem entre sessões e são salvos automaticamente a cada 30 segundos.

## 🎯 Funcionalidades Avançadas

### Sistema de Estado Global
- Gerenciamento centralizado de dados
- Sincronização automática entre componentes
- Validação e tratamento de erros

### Otimizações de Performance
- Renderização eficiente de listas
- Debounce em operações de salvamento
- Lazy loading de componentes pesados

### Experiência do Usuário
- Feedback visual imediato
- Confirmações para ações destrutivas
- Tooltips informativos
- Estados de loading

## 🔮 Possíveis Melhorias Futuras

- [ ] Sincronização com APIs externas (Google Calendar, Todoist)
- [ ] Modo escuro/claro
- [ ] Notificações push do navegador
- [ ] Exportação de dados (JSON, CSV)
- [ ] Temas personalizáveis
- [ ] Integração com redes sociais
- [ ] Modo offline com Service Workers

## 📄 Licença

Este projeto é open source e está disponível sob a licença MIT.

---

**Desenvolvido com ❤️ para maximizar sua produtividade pessoal!**
