// Enable chromereload by uncommenting this line:
import 'chromereload/devonly'

chrome.runtime.onInstalled.addListener((details) => {
  console.log('previousVersion', details.previousVersion)
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  chrome.pageAction.show(tabId)
})

chrome.tabs.onCreated.addListener((tab) => {

})

const Popup = require('./popup/Popup')
// PVSCL:IFCOND(Hypothesis, LINE)
const HypothesisManager = require('./background/HypothesisManager')
// PVSCL:ENDCOND
// PVSCL:IFCOND(GSheetProvider or GSheetConsumer, LINE)
const GoogleSheetsManager = require('./background/GoogleSheetsManager')
// PVSCL:ENDCOND
// PVSCL:IFCOND(DOI or NavigationScript, LINE)
const TargetManager = require('./background/TargetManager')
// PVSCL:ENDCOND
// PVSCL:IFCOND(Storage->pv:SelectedChildren()->pv:Size()>1, LINE)
const StorageManager = require('./background/StorageManager')
// PVSCL:ENDCOND

const _ = require('lodash')

class Background {
  constructor () {
    // PVSCL:IFCOND(Hypothesis, LINE)
    this.hypothesisManager = null
    // PVSCL:ENDCOND
    this.tabs = {}
  }

  init () {
    // PVSCL:IFCOND(Hypothesis, LINE)
    // Initialize hypothesis manager
    this.hypothesisManager = new HypothesisManager()
    this.hypothesisManager.init()

    // PVSCL:ENDCOND
    // PVSCL:IFCOND(GSheetProvider or GSheetConsumer, LINE)
    // Initialize google sheets manager
    this.googleSheetsManager = new GoogleSheetsManager()
    this.googleSheetsManager.init()

    // PVSCL:ENDCOND
    // PVSCL:IFCOND(DOI or NavigationScript, LINE)
    // Initialize doi manager
    this.targetManager = new TargetManager()
    this.targetManager.init()

    // PVSCL:ENDCOND
    // PVSCL:IFCOND(Storage->pv:SelectedChildren()->pv:Size()>1, LINE)
    // Initialize storage manager
    this.storageManager = new StorageManager()
    this.storageManager.init()

    // PVSCL:ENDCOND
    // Initialize page_action event handler
    chrome.pageAction.onClicked.addListener((tab) => {
      // PVSCL:IFCOND(URN, LINE)
      // Check if current tab is a local file
      if (tab.url.startsWith('file://')) {
        // Check if permission to access file URL is enabled
        chrome.extension.isAllowedFileSchemeAccess((isAllowedAccess) => {
          if (isAllowedAccess === false) {
            chrome.tabs.create({url: chrome.runtime.getURL('pages/filePermission.html')})
          } else {
            if (this.tabs[tab.id]) {
              if (this.tabs[tab.id].activated) {
                this.tabs[tab.id].deactivate()
              } else {
                this.tabs[tab.id].activate()
              }
            } else {
              this.tabs[tab.id] = new Popup()
              this.tabs[tab.id].activate()
            }
          }
        })
      } else {
        if (this.tabs[tab.id]) {
          if (this.tabs[tab.id].activated) {
            this.tabs[tab.id].deactivate()
          } else {
            this.tabs[tab.id].activate()
          }
        } else {
          this.tabs[tab.id] = new Popup()
          this.tabs[tab.id].activate()
        }
      }
      // PVSCL:ELSECOND
      if (this.tabs[tab.id]) {
        if (this.tabs[tab.id].activated) {
          this.tabs[tab.id].deactivate()
        } else {
          this.tabs[tab.id].activate()
        }
      } else {
        this.tabs[tab.id] = new Popup()
        this.tabs[tab.id].activate()
      }
      // PVSCL:ENDCOND
    })

    // On tab is reloaded
    chrome.tabs.onUpdated.addListener((tabId) => {
      if (this.tabs[tabId]) {
        if (this.tabs[tabId].activated) {
          this.tabs[tabId].activate()
        }
      } else {
        this.tabs[tabId] = new Popup()
      }
    })

    // Initialize message manager
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.scope === 'extension') {
        if (request.cmd === 'whoiam') {
          sendResponse(sender)
        } else if (request.cmd === 'deactivatePopup') {
          if (!_.isEmpty(this.tabs) && !_.isEmpty(this.tabs[sender.tab.id])) {
            this.tabs[sender.tab.id].deactivate()
          }
          sendResponse(true)
        } else if (request.cmd === 'activatePopup') {
          if (!_.isEmpty(this.tabs) && !_.isEmpty(this.tabs[sender.tab.id])) {
            this.tabs[sender.tab.id].activate()
          }
          sendResponse(true)
        } else if (request.cmd === 'amIActivated') {
          if (this.tabs[sender.tab.id].activated) {
            sendResponse({activated: true})
          } else {
            sendResponse({activated: false})
          }
        }
      }
    })
  }
}

window.background = new Background()
window.background.init()
