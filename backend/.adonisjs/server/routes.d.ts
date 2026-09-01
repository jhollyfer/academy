import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'authentication.sign-in': { paramsTuple?: []; params?: {} }
    'authentication.sign-out': { paramsTuple?: []; params?: {} }
    'storages.create': { paramsTuple?: []; params?: {} }
    'storages.complete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'storages.parts': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'storages.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'storages.download': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'account.profile': { paramsTuple?: []; params?: {} }
    'administrator.courses.paginate': { paramsTuple?: []; params?: {} }
    'administrator.courses.create': { paramsTuple?: []; params?: {} }
    'administrator.courses.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administrator.courses.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administrator.classes.paginate': { paramsTuple?: []; params?: {} }
    'administrator.classes.create': { paramsTuple?: []; params?: {} }
    'administrator.classes.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administrator.classes.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administrator.enrollments.paginate': { paramsTuple?: []; params?: {} }
    'administrator.enrollments.export': { paramsTuple?: []; params?: {} }
    'administrator.enrollments.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administrator.enrollments.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administrator.lifecycle.courses.archive': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administrator.lifecycle.courses.unarchive': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administrator.lifecycle.courses.purge': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administrator.lifecycle.classes.archive': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administrator.lifecycle.classes.unarchive': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administrator.lifecycle.classes.purge': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administrator.lifecycle.enrollments.archive': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administrator.lifecycle.enrollments.unarchive': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administrator.lifecycle.enrollments.purge': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  GET: {
    'storages.parts': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'storages.download': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'account.profile': { paramsTuple?: []; params?: {} }
    'administrator.courses.paginate': { paramsTuple?: []; params?: {} }
    'administrator.courses.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administrator.classes.paginate': { paramsTuple?: []; params?: {} }
    'administrator.classes.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administrator.enrollments.paginate': { paramsTuple?: []; params?: {} }
    'administrator.enrollments.export': { paramsTuple?: []; params?: {} }
    'administrator.enrollments.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  HEAD: {
    'storages.parts': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'storages.download': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'account.profile': { paramsTuple?: []; params?: {} }
    'administrator.courses.paginate': { paramsTuple?: []; params?: {} }
    'administrator.courses.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administrator.classes.paginate': { paramsTuple?: []; params?: {} }
    'administrator.classes.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administrator.enrollments.paginate': { paramsTuple?: []; params?: {} }
    'administrator.enrollments.export': { paramsTuple?: []; params?: {} }
    'administrator.enrollments.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  POST: {
    'authentication.sign-in': { paramsTuple?: []; params?: {} }
    'authentication.sign-out': { paramsTuple?: []; params?: {} }
    'storages.create': { paramsTuple?: []; params?: {} }
    'storages.complete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administrator.courses.create': { paramsTuple?: []; params?: {} }
    'administrator.classes.create': { paramsTuple?: []; params?: {} }
  }
  DELETE: {
    'storages.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administrator.lifecycle.courses.purge': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administrator.lifecycle.classes.purge': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administrator.lifecycle.enrollments.purge': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PUT: {
    'administrator.courses.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administrator.classes.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administrator.enrollments.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PATCH: {
    'administrator.lifecycle.courses.archive': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administrator.lifecycle.courses.unarchive': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administrator.lifecycle.classes.archive': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administrator.lifecycle.classes.unarchive': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administrator.lifecycle.enrollments.archive': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administrator.lifecycle.enrollments.unarchive': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}