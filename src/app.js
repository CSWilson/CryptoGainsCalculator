import './stylesheets/main.css'
import './helpers/context_menu.js'
import './helpers/external_links.js'
import storage from 'electron-json-storage'
import Vue from 'vue/dist/vue.min.js'
import axios from 'axios'
import accounting from 'accounting'
import { remote } from 'electron'

const app = remote.app
storage.setDataPath(app.getAppPath() + '/userData')

Vue.filter('currency', (value) => {
  return accounting.formatMoney(value, '$', 2)
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  computed: {
    totalCoins () {
      return this.userData.investment / this.initialPrice
    },
    projectedTotal () {
      return this.userData.projectedPrice * this.totalCoins
    },
    projectedProfit () {
      let total = (this.projectedTotal - this.userData.investment)
      return total - ((total * this.fees.service) / 100)
    },
    afterFees () {
      return this.projectedProfit - ((this.projectedProfit * this.fees.service) / 100)
    },
    afterTaxes () {
      return this.afterFees * this.fees.tax
    },
    isPreLoading () {
      return this.firstLoad
    }
  },
  data: {
    version: app.getVersion(),
    cookie: '',
    firstLoad: true,
    loadingCoins: false,
    loadingCoinPrice: false,
    coins: {},
    currency: 'USD',
    allowedCoins: ['ETH', 'BTC', 'ADA', 'TRX', 'XRP', 'IOT', 'NEO', 'XLM', 'EOS', 'DASH', 'USDT'],
    initialPrice: 0,
    fees: {
      service: 0.30,
      tax: 0.75
    },
    userData: {
      investment: 1000,
      projectedPrice: 25,
      selectedCoin: 'XRP'
    }
  },
  mounted () {
    this.getCoins()
    setTimeout(() => {
      this.firstLoad = false
    }, 1500)
    storage.get('data', (error, data) => {
      if (!error && data.investment !== '' && typeof data.investment === 'number') {
        this.userData.investment = data.investment
      }
    })
    storage.get('data', (error, data) => {
      if (!error && data.selectedCoin !== '' && typeof data.selectedCoin === 'string') {
        this.userData.selectedCoin = data.selectedCoin
      }
    })
    storage.get('data', (error, data) => {
      if (!error && data.projectedPrice !== '' && typeof data.projectedPrice === 'number') {
        this.userData.projectedPrice = data.projectedPrice
      }
    })

    window.setInterval(() => {
      console.log('Loading Coin...')
      this.getCoinPrice(this.userData.selectedCoin)
    }, 60000)
  },
  methods: {
    formatMoney (meth, val) {
      return (meth === 'add') ? accounting.formatMoney(val, '', 2) : accounting.formatMoney(val, '', 2)
    },
    getCoins () {
      this.loadingCoins = true
      axios.get('https://www.cryptocompare.com/api/data/coinlist').then(response => {
        this.coins = (response.status === 200) && Object.keys(response.data.Data)
          .filter(key => this.allowedCoins.includes(key))
          .reduce((obj, key) => {
            obj[key] = response.data.Data[key]
            return obj
          }, {})
        this.getCoinPrice(this.userData.selectedCoin)
        this.loadingCoins = false
      })
    },
    getCoinPrice (coin = 'XRP') {
      this.loadingCoinPrice = true
      axios.get('https://min-api.cryptocompare.com/data/price?fsym=' + coin + '&tsyms=' + this.currency).then(response => {
        this.initialPrice = (response.status === 200) && response.data.USD
        this.loadingCoinPrice = false
        storage.set('data', this.userData, (error) => {
          if (error) throw error
        })
      })
    },
    clear () {
      storage.clear((error) => {
        if (error) throw error
      })
      this.userData = {
        investment: 1000,
        projectedPrice: 25,
        selectedCoin: 'XRP'
      }
      this.getCoinPrice(this.userData.selectedCoin)
    },
    objLength (obj) {
      return (typeof obj === 'object') && Object.keys(obj).length
    },
    updateInvestment () {
      this.userData.investment = parseInt(this.userData.investment)
      storage.set('data', this.userData, (error) => {
        if (error) throw error
      })
    },
    updateProjectedPrice () {
      this.userData.projectedPrice = parseInt(this.userData.projectedPrice)
      storage.set('data', this.userData, (error) => {
        if (error) throw error
      })
    }
  }
})
