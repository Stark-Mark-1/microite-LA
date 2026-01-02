import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    isLoading: false,
    showbg: true,
    showhome: true,
    showdata: false,
    showfinal: false,
  }),
  actions: { 
    getAppsScriptUrl(): string {
    return 'https://script.google.com/macros/s/AKfycbxrzN4tG_NRt8MUZy0H7-I9U4LTsJRg5yf2lPw7NQbAWYYUpDK4MHVNh8dKLL287b_g/exec'
  },

  sendAnalyticsData(event: string): void {
      const url = this.getAppsScriptUrl()
        fetch(url + "?type=" + event);
  },
  getAppsScriptUrlForm(): string {
    return 'https://script.google.com/macros/s/AKfycbz-_ewtYzykpgohJ2SVh2gL5Y1_j5dKgxiaPormY-x140to43MsyueJacr4lAO9JSrXtA/exec'
  },
  async sendFormData(firstName: string, lastName: string, email: string, hospital: string, shirtsize: string, jacketsize: string) {
    const url = this.getAppsScriptUrlForm()
    const form = new FormData()
    form.append('FirstName', firstName)
    form.append('LastName', lastName)
    form.append('Email', email)
    form.append('Hospital', hospital)
    form.append('ShirtSize', shirtsize)
    form.append('JacketSize', jacketsize)
  
    const res = await fetch(url, {
      method: 'POST',
      body: form,
    })
  },
},
})
