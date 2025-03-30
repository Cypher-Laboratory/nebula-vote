/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  tutorialSidebar: [
    {
      type: 'doc',
      id: 'introduction',
      label: 'Introduction',
    },
    {
      type: 'doc',
      id: 'discord-bot',
      label: 'Discord Bot',
    },
    {
      type: 'doc',
      id: 'telegram-bot',
      label: 'Telegram Bot',
    },
    {
      type: 'category',
      label: 'Developer Guide',
      items: [
        'developer-guide/discord',
        'developer-guide/telegram',
      ],
    },
  ],
};

module.exports = sidebars;