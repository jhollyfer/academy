import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'authentication.sign-in': { paramsTuple?: []; params?: {} }
    'authentication.sign-out': { paramsTuple?: []; params?: {} }
    'administrator.courses.paginate': { paramsTuple?: []; params?: {} }
    'administrator.courses.create': { paramsTuple?: []; params?: {} }
    'administrator.courses.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administrator.courses.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administrator.classes.paginate': { paramsTuple?: []; params?: {} }
    'administrator.classes.create': { paramsTuple?: []; params?: {} }
    'administrator.classes.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administrator.classes.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administrator.lifecycle.courses.archive': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administrator.lifecycle.courses.unarchive': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administrator.lifecycle.courses.purge': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administrator.lifecycle.classes.archive': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administrator.lifecycle.classes.unarchive': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administrator.lifecycle.classes.purge': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  GET: {
    'administrator.courses.paginate': { paramsTuple?: []; params?: {} }
    'administrator.courses.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administrator.classes.paginate': { paramsTuple?: []; params?: {} }
    'administrator.classes.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  HEAD: {
    'administrator.courses.paginate': { paramsTuple?: []; params?: {} }
    'administrator.courses.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administrator.classes.paginate': { paramsTuple?: []; params?: {} }
    'administrator.classes.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  POST: {
    'authentication.sign-in': { paramsTuple?: []; params?: {} }
    'authentication.sign-out': { paramsTuple?: []; params?: {} }
    'administrator.courses.create': { paramsTuple?: []; params?: {} }
    'administrator.classes.create': { paramsTuple?: []; params?: {} }
  }
  PUT: {
    'administrator.courses.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administrator.classes.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PATCH: {
    'administrator.lifecycle.courses.archive': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administrator.lifecycle.courses.unarchive': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administrator.lifecycle.classes.archive': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administrator.lifecycle.classes.unarchive': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  DELETE: {
    'administrator.lifecycle.courses.purge': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administrator.lifecycle.classes.purge': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}