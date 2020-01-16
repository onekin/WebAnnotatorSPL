const _ = require('lodash')
const TargetManager = require('../target/TargetManager')
const Sidebar = require('./Sidebar')
const TagManager = require('./TagManager')
const Config = require('../Config')
const Toolset = require('./Toolset')
const AnnotationManagement = require('../annotationManagement/AnnotationManagement')
const GroupSelector = require('../groupManipulation/GroupSelector')
const AnnotationBasedInitializer = require('./AnnotationBasedInitializer')
const {AnnotatedContentManager} = require('./AnnotatedContentManager')
// PVSCL:IFCOND(Manual, LINE)
const Events = require('../Events')
// PVSCL:ENDCOND
// PVSCL:IFCOND(MoodleURL, LINE)
const RolesManager = require('./RolesManager')
// PVSCL:ENDCOND
// PVSCL:IFCOND(Hypothesis, LINE)
const HypothesisClientManager = require('../annotationServer/hypothesis/HypothesisClientManager')
// PVSCL:ENDCOND
// PVSCL:IFCOND(BrowserStorage, LINE)
const BrowserStorageManager = require('../annotationServer/browserStorage/BrowserStorageManager')
// PVSCL:ENDCOND
// PVSCL:IFCOND(UserFilter, LINE)
const UserFilter = require('../annotationManagement/read/UserFilter')
// PVSCL:ENDCOND
// PVSCL:IFCOND(PreviousAssignments, LINE)
const PreviousAssignments = require('../production/PreviousAssignments')
// PVSCL:ENDCOND
// PVSCL:IFCOND(MoodleReport, LINE)
const MoodleReport = require('../consumption/visualizations/MoodleReport')
// PVSCL:ENDCOND
// PVSCL:IFCOND(MoodleComment, LINE)
const MoodleComment = require('../consumption/visualizations/MoodleComment')
// PVSCL:ENDCOND

class ContentScriptManager {
  constructor () {
    this.events = {}
    this.status = ContentScriptManager.status.notInitialized
  }

  init () {
    console.debug('Initializing content script manager')
    this.status = ContentScriptManager.status.initializing
    this.loadTargetManager(() => {
      this.loadAnnotationServer(() => {
        window.abwa.sidebar = new Sidebar()
        window.abwa.sidebar.init(() => {
          window.abwa.annotationBasedInitializer = new AnnotationBasedInitializer()
          window.abwa.annotationBasedInitializer.init(() => {
            window.abwa.groupSelector = new GroupSelector()
            window.abwa.groupSelector.init(() => {
              // Reload for first time the content by group
              this.reloadContentByGroup()
              // PVSCL:IFCOND(Manual,LINE)
              // Initialize listener for group change to reload the content
              this.initListenerForGroupChange()
              // PVSCL:ENDCOND
            })
          })
        })
      })
    })
  }
  // PVSCL:IFCOND(Manual, LINE)

  initListenerForGroupChange () {
    this.events.groupChangedEvent = this.groupChangedEventHandlerCreator()
    document.addEventListener(Events.groupChanged, this.events.groupChangedEvent, false)
  }

  groupChangedEventHandlerCreator () {
    return (event) => {
      this.reloadContentByGroup()
    }
  }
  // PVSCL:ENDCOND

  reloadContentByGroup (callback) {
    // TODO Use async await or promises
    this.reloadTagsManager()
      /* .then(() => {
        return this.reloadContentAnnotator()
      }) */
      .then(() => {
        return this.reloadToolset()
      })
      .then(() => {
        return this.reloadAnnotationManagement()
      })
      // PVSCL:IFCOND(MoodleReport, LINE)
      .then(() => {
        return this.reloadMoodleReport()
      })
      // PVSCL:ENDCOND
      // PVSCL:IFCOND(MoodleComment, LINE)
      .then(() => {
        return this.reloadMoodleComment()
      })
      // PVSCL:ENDCOND
      // TODO Uncomment
      /* .then(() => {
        return this.reloadAnnotatedContentManager()
      }) */
      // PVSCL:IFCOND(UserFilter, LINE)
      .then(() => {
        return this.reloadUserFilter()
      })
      // PVSCL:ENDCOND
      // PVSCL:IFCOND(MoodleURL, LINE)
      .then(() => {
        return this.reloadRolesManager()
      })
      .then(() => {
        return this.reloadPreviousAssignments()
      })
      // PVSCL:ENDCOND
      .then(() => {
        this.status = ContentScriptManager.status.initialized
        console.debug('Initialized content script manager')
      })
  }

  reloadAnnotatedContentManager () {
    return new Promise((resolve, reject) => {
      // TODO Destroy annotated content manager
      this.destroyAnnotatedContentManager()
      // Create a new annotated content manager
      window.abwa.annotatedContentManager = new AnnotatedContentManager()
      window.abwa.annotatedContentManager.init((err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  reloadAnnotationManagement () {
    return new Promise((resolve, reject) => {
      // Destroy current content annotator
      this.destroyContentAnnotator()
      // Create a new content annotator for the current group
      window.abwa.annotationManagement = new AnnotationManagement()
      window.abwa.annotationManagement.init((err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  reloadTagsManager () {
    return new Promise((resolve, reject) => {
      // Destroy current tag manager
      this.destroyTagsManager()
      // Create a new tag manager for the current group
      window.abwa.tagManager = new TagManager(Config.namespace, Config.tags) // TODO Depending on the type of annotator
      window.abwa.tagManager.init((err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }
  // PVSCL:IFCOND(UserFilter, LINE)

  reloadUserFilter (callback) {
    return new Promise((resolve, reject) => {
      // Destroy current augmentation operations
      this.destroyUserFilter()
      // Create augmentation operations for the current group
      window.abwa.userFilter = new UserFilter(Config)
      window.abwa.userFilter.init((err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }
  // PVSCL:ENDCOND
  // PVSCL:IFCOND(MoodleReport, LINE)

  reloadMoodleReport () {
    return new Promise((resolve, reject) => {
      // Destroy current content annotator
      this.destroyMoodleReport()
      // Create a new content annotator for the current group
      window.abwa.moodleReport = new MoodleReport()
      window.abwa.moodleReport.init((err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }
  // PVSCL:ENDCOND
  // PVSCL:IFCOND(MoodleComment, LINE)

  reloadMoodleComment () {
    return new Promise((resolve, reject) => {
      // Destroy current content annotator
      this.destroyMoodleComment()
      // Create a new content annotator for the current group
      window.abwa.moodleComment = new MoodleComment()
      window.abwa.moodleComment.init((err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }
  // PVSCL:ENDCOND
  // PVSCL:IFCOND(MoodleURL, LINE)

  reloadRolesManager () {
    return new Promise((resolve, reject) => {
      // Destroy current content annotator
      this.destroyRolesManager()
      // Create a new content annotator for the current group
      window.abwa.rolesManager = new RolesManager()
      window.abwa.rolesManager.init((err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }
  // PVSCL:IFCOND(PreviousAssignments, LINE)

  reloadPreviousAssignments () {
    return new Promise((resolve, reject) => {
      // Destroy current content annotator
      this.destroyPreviousAssignments()
      // Create a new content annotator for the current group
      if (window.abwa.rolesManager.role === Config.tags.producer) {
        window.abwa.previousAssignments = new PreviousAssignments()
        window.abwa.previousAssignments.init((err) => {
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        })
      } else {
        resolve()
      }
    })
  }
  // PVSCL:ENDCOND
  // PVSCL:ENDCOND

  reloadToolset () {
    return new Promise((resolve, reject) => {
      // Destroy toolset
      this.destroyToolset()
      // Create a new toolset
      window.abwa.toolset = new Toolset()
      window.abwa.toolset.init((err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }
  // PVSCL:IFCOND(UserFilter, LINE)

  destroyUserFilter () {
    // Destroy current augmentation operations
    if (!_.isEmpty(window.abwa.userFilter)) {
      window.abwa.userFilter.destroy()
    }
  }
  // PVSCL:ENDCOND
  // PVSCL:IFCOND(MoodleReport, LINE)

  destroyMoodleReport () {
    // Destroy current augmentation operations
    if (!_.isEmpty(window.abwa.moodleReport)) {
      window.abwa.moodleReport.destroy()
    }
  }
  // PVSCL:ENDCOND
  // PVSCL:IFCOND(MoodleComment, LINE)

  destroyMoodleComment () {
    // Destroy current augmentation operations
    if (!_.isEmpty(window.abwa.moodleComment)) {
      window.abwa.moodleComment.destroy()
    }
  }
  // PVSCL:ENDCOND

  destroyContentAnnotator () {
    // Destroy current content annotator
    if (!_.isEmpty(window.abwa.contentAnnotator)) {
      window.abwa.contentAnnotator.destroy()
    }
  }

  destroyTagsManager () {
    if (!_.isEmpty(window.abwa.tagManager)) {
      window.abwa.tagManager.destroy()
    }
  }

  destroyAnnotatedContentManager () {
    if (window.abwa.annotatedContentManager) {
      window.abwa.annotatedContentManager.destroy()
    }
  }
  // PVSCL:IFCOND(MoodleURL, LINE)

  destroyRolesManager () {
    // Destroy current augmentation operations
    if (window.abwa.rolesManager) {
      window.abwa.rolesManager.destroy()
    }
  }

  destroyPreviousAssignments () {
    // Destroy current augmentation operations
    if (window.abwa.previousAssignments) {
      window.abwa.previousAssignments.destroy()
    }
  }
  // PVSCL:ENDCOND

  destroyToolset () {
    if (window.abwa.toolset) {
      window.abwa.toolset.destroy()
    }
  }

  destroy (callback) {
    console.debug('Destroying content script manager')
    this.destroyTargetManager(() => {
      this.destroyTagsManager()
      this.destroyContentAnnotator()
      // PVSCL:IFCOND(UserFilter, LINE)
      this.destroyUserFilter()
      // PVSCL:ENDCOND
      this.destroyToolset()
      // PVSCL:IFCOND(MoodleURL, LINE)
      this.destroyRolesManager()
      this.destroyPreviousAssignments()
      // PVSCL:ENDCOND
      // TODO Destroy groupSelector, roleManager,
      window.abwa.groupSelector.destroy(() => {
        window.abwa.sidebar.destroy(() => {
          this.destroyAnnotationServer(() => {
            this.status = ContentScriptManager.status.notInitialized
            console.debug('Correctly destroyed content script manager')
            if (_.isFunction(callback)) {
              callback()
            }
          })
        })
      })
      // PVSCL:IFCOND(Manual, LINE)
      document.removeEventListener(Events.groupChanged, this.events.groupChangedEvent)
      // PVSCL:ENDCOND
    })
  }

  loadTargetManager (callback) {
    window.abwa.targetManager = new TargetManager()
    window.abwa.targetManager.init(() => {
      if (_.isFunction(callback)) {
        callback()
      }
    })
  }

  destroyTargetManager (callback) {
    if (window.abwa.targetManager) {
      window.abwa.targetManager.destroy(() => {
        if (_.isFunction(callback)) {
          callback()
        }
      })
    }
  }

  loadAnnotationServer (callback) {
    // PVSCL:IFCOND(AnnotationServer->pv:SelectedChildren()->pv:Size()=1, LINE)
    // PVSCL:IFCOND(Hypothesis, LINE)
    window.abwa.annotationServerManager = new HypothesisClientManager()
    // PVSCL:ENDCOND
    // PVSCL:IFCOND(BrowserStorage, LINE)
    window.abwa.annotationServerManager = new BrowserStorageManager()
    // PVSCL:ENDCOND
    window.abwa.annotationServerManager.init((err) => {
      if (_.isFunction(callback)) {
        if (err) {
          callback(err)
        } else {
          callback()
        }
      }
    })
    // PVSCL:ELSECOND
    chrome.runtime.sendMessage({scope: 'annotationServer', cmd: 'getSelectedAnnotationServer'}, ({annotationServer}) => {
      if (annotationServer === 'hypothesis') {
        // Hypothesis
        window.abwa.annotationServerManager = new HypothesisClientManager()
      } else {
        // Browser storage
        window.abwa.annotationServerManager = new BrowserStorageManager()
      }
      window.abwa.annotationServerManager.init((err) => {
        if (_.isFunction(callback)) {
          if (err) {
            callback(err)
          } else {
            callback()
          }
        }
      })
    })
    // PVSCL:ENDCOND
  }

  destroyAnnotationServer (callback) {
    if (window.abwa.annotationServerManager) {
      window.abwa.annotationServerManager.destroy(callback)
    }
  }
}

ContentScriptManager.status = {
  initializing: 'initializing',
  initialized: 'initialized',
  notInitialized: 'notInitialized'
}

module.exports = ContentScriptManager
