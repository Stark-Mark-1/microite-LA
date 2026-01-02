export const assetBase = (() => {
    const host = window.location.hostname
  
    const isLocal =
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === 'lustrous-dieffenbachia-857991.netlify.app' ||
      host.startsWith('192.168.') ||
      host.startsWith('10.') ||
      host.endsWith('.local')
  
    // return isLocal ? '../../assets/' : 'https://thecollectivecdncampaignassets.wavelaps.in/'
    return '../../assets/'
  })()