const Events = {
  // Annotation management events
  annotationCreated: 'annotationCreated',
  annotationUpdated: 'annotationUpdated',
  annotationDeleted: 'annotationDeleted',
  // PVSCL:IFCOND(Validate, LINE)
  annotationValidated: 'annotationValidated',
  // PVSCL:ENDCOND
  createAnnotation: 'createAnnotation',
  updateAnnotation: 'updateAnnotation',
  deleteAnnotation: 'deleteAnnotation',
  updatedAllAnnotations: 'updatedAllAnnotations',
  // PVSCL:IFCOND(UserFilter, LINE)
  userFilterChange: 'userFilterChange',
  // PVSCL:ENDCOND
  updatedDocumentURL: 'updatedDocumentURL',
  // PVSCL:IFCOND(Comment, LINE)
  comment: 'annotationComment',
  // PVSCL:ENDCOND
  // PVSCL:IFCOND(Reply, LINE)
  reply: 'reply',
  // PVSCL:ENDCOND
  // PVSCL:IFCOND(DeleteAll, LINE)
  deleteAllAnnotations: 'deleteAllAnnotations',
  deletedAllAnnotations: 'deletedAllAnnotations',
  // PVSCL:ENDCOND
  // PVSCL:IFCOND(Filter, LINE)
  updatedCurrentAnnotations: 'updatedCurrentAnnotations',
  // PVSCL:ENDCOND
  // PVSCL:IFCOND(Codebook, LINE)
  // Annotation codebook management events
  createCodebook: 'createCodebook',
  codebookCreated: 'codebookCreated',
  createTheme: 'createTheme',
  themeCreated: 'themeCreated',
  removeTheme: 'removeTheme',
  themeRemoved: 'themeRemoved',
  // PVSCL:IFCOND(Hierarchy, LINE)
  createCode: 'createCode',
  codeCreated: 'codeCreated',
  removeCode: 'removeCode',
  codeRemoved: 'codeRemoved',
  // PVSCL:ENDCOND
  // PVSCL:IFCOND(RenameCodebook, LINE)
  renameCodebook: 'renameCodebook',
  codebookRenamed: 'codebookRenamed',
  // PVSCL:ENDCOND
  // PVSCL:IFCOND(ExportCodebook, LINE)
  exportCodebook: 'exportCodebook',
  codebookExported: 'codebookExported',
  // PVSCL:ENDCOND
  // PVSCL:IFCOND(ImportCodebook, LINE)
  importCodebook: 'importCodebook',
  codebookImported: 'codebookImported',
  // PVSCL:ENDCOND
  // PVSCL:ENDCOND
  // PVSCL:IFCOND(CodebookDelete, LINE)
  deleteCodebook: 'deleteCodebook',
  codebookDeleted: 'codebookDeleted',
  // PVSCL:ENDCOND
  targetChanged: 'targetChanged', // TODO Review if it is used somewhere
  // PVSCL:IFCOND(NOT (Multivalued), LINE)
  codeToAll: 'codeToAll',
  // PVSCL:ENDCOND
  // PVSCL:IFCOND(Manual, LINE)
  groupChanged: 'groupChanged',
  // PVSCL:ENDCOND
  // PVSCL:IFCOND(ImportAnnotations, LINE)
  annotationsImported: 'annotationsImported',
  // PVSCL:ENDCOND
  codebookRead: 'codebookRead' // Not in codebook variation point because absense of Codebook/Classifying also requires this event currently
}

module.exports = Events
