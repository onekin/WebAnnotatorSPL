const Events = require('../../../Events')
// PVSCL:IFCOND(BuiltIn, LINE)
const BuiltIn = require('./builtIn/BuiltIn')
const EmptyCodebook = require('./emptyCodebook/EmptyCodebook')
// PVSCL:ENDCOND
// PVSCL:IFCOND(NOT(Classifying), LINE)
const NoCodebook = require('./noCodebook/NoCodebook')
// PVSCL:ENDCOND
const Codebook = require('../../model/Codebook')
const LanguageUtils = require('../../../utils/LanguageUtils')
const Alerts = require('../../../utils/Alerts')

class CreateCodebook {
  constructor () {
    this.events = {}
  }

  /**
   * Initializes codebook creator funcionality
   */
  init () {
    // Add event listener for createCodebook event
    this.initCreateCodebookEvent()
  }

  /**
   * Initializes codebook create event listener
   */
  initCreateCodebookEvent () {
    this.events.createCodebook = {element: document, event: Events.createCodebook, handler: this.createCodebookEventHandler()}
    this.events.createCodebook.element.addEventListener(this.events.createCodebook.event, this.events.createCodebook.handler, false)
  }

  createCodebookEventHandler () {
    return (event) => {
      let promise = new Promise((resolve, reject) => {
        // PVSCL:IFCOND(BuiltIn, LINE)
        let howCreate = event.detail.howCreate
        if (howCreate === 'builtIn') {
          BuiltIn.createDefaultAnnotations((err, annotations) => {
            if (err) {
              reject(err)
            } else {
              resolve()
            }
          })
        }
        if (howCreate === 'emptyCodebook') {
          EmptyCodebook.createDefaultAnnotations((err, annotations) => {
            if (err) {
              reject(err)
            } else {
              resolve(annotations)
            }
          })
        }
        // PVSCL:ELSEIFCOND(NOT(Codebook), LINE)
        NoCodebook.createDefaultAnnotations((err, annotations) => {
          if (err) {
            reject(err)
          } else {
            resolve(annotations)
          }
        })
        // PVSCL:ENDCOND
      })
      promise.catch((err) => {
        Alerts.errorAlert({text: err})
      }).then((annotations) => {
        Codebook.fromAnnotations(annotations, (err, codebook) => {
          if (err) {
            Alerts.errorAlert({text: 'Unable to create a codebook. Error: ' + err.message})
          } else {
            LanguageUtils.dispatchCustomEvent(Events.codebookCreated, {codebook: codebook})
          }
        })
      })
    }
  }
}

module.exports = CreateCodebook