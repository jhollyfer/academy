/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'authentication.sign-in': {
    methods: ["POST"],
    pattern: '/authentication/sign-in',
    tokens: [{"old":"/authentication/sign-in","type":0,"val":"authentication","end":""},{"old":"/authentication/sign-in","type":0,"val":"sign-in","end":""}],
    types: placeholder as Registry['authentication.sign-in']['types'],
  },
  'authentication.sign-out': {
    methods: ["POST"],
    pattern: '/authentication/sign-out',
    tokens: [{"old":"/authentication/sign-out","type":0,"val":"authentication","end":""},{"old":"/authentication/sign-out","type":0,"val":"sign-out","end":""}],
    types: placeholder as Registry['authentication.sign-out']['types'],
  },
  'administrator.courses.paginate': {
    methods: ["GET","HEAD"],
    pattern: '/administrator/courses',
    tokens: [{"old":"/administrator/courses","type":0,"val":"administrator","end":""},{"old":"/administrator/courses","type":0,"val":"courses","end":""}],
    types: placeholder as Registry['administrator.courses.paginate']['types'],
  },
  'administrator.courses.create': {
    methods: ["POST"],
    pattern: '/administrator/courses',
    tokens: [{"old":"/administrator/courses","type":0,"val":"administrator","end":""},{"old":"/administrator/courses","type":0,"val":"courses","end":""}],
    types: placeholder as Registry['administrator.courses.create']['types'],
  },
  'administrator.courses.show': {
    methods: ["GET","HEAD"],
    pattern: '/administrator/courses/:id',
    tokens: [{"old":"/administrator/courses/:id","type":0,"val":"administrator","end":""},{"old":"/administrator/courses/:id","type":0,"val":"courses","end":""},{"old":"/administrator/courses/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['administrator.courses.show']['types'],
  },
  'administrator.courses.update': {
    methods: ["PUT"],
    pattern: '/administrator/courses/:id',
    tokens: [{"old":"/administrator/courses/:id","type":0,"val":"administrator","end":""},{"old":"/administrator/courses/:id","type":0,"val":"courses","end":""},{"old":"/administrator/courses/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['administrator.courses.update']['types'],
  },
  'administrator.classes.paginate': {
    methods: ["GET","HEAD"],
    pattern: '/administrator/classes',
    tokens: [{"old":"/administrator/classes","type":0,"val":"administrator","end":""},{"old":"/administrator/classes","type":0,"val":"classes","end":""}],
    types: placeholder as Registry['administrator.classes.paginate']['types'],
  },
  'administrator.classes.create': {
    methods: ["POST"],
    pattern: '/administrator/classes',
    tokens: [{"old":"/administrator/classes","type":0,"val":"administrator","end":""},{"old":"/administrator/classes","type":0,"val":"classes","end":""}],
    types: placeholder as Registry['administrator.classes.create']['types'],
  },
  'administrator.classes.show': {
    methods: ["GET","HEAD"],
    pattern: '/administrator/classes/:id',
    tokens: [{"old":"/administrator/classes/:id","type":0,"val":"administrator","end":""},{"old":"/administrator/classes/:id","type":0,"val":"classes","end":""},{"old":"/administrator/classes/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['administrator.classes.show']['types'],
  },
  'administrator.classes.update': {
    methods: ["PUT"],
    pattern: '/administrator/classes/:id',
    tokens: [{"old":"/administrator/classes/:id","type":0,"val":"administrator","end":""},{"old":"/administrator/classes/:id","type":0,"val":"classes","end":""},{"old":"/administrator/classes/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['administrator.classes.update']['types'],
  },
  'administrator.enrollments.paginate': {
    methods: ["GET","HEAD"],
    pattern: '/administrator/enrollments',
    tokens: [{"old":"/administrator/enrollments","type":0,"val":"administrator","end":""},{"old":"/administrator/enrollments","type":0,"val":"enrollments","end":""}],
    types: placeholder as Registry['administrator.enrollments.paginate']['types'],
  },
  'administrator.enrollments.export': {
    methods: ["GET","HEAD"],
    pattern: '/administrator/enrollments/export',
    tokens: [{"old":"/administrator/enrollments/export","type":0,"val":"administrator","end":""},{"old":"/administrator/enrollments/export","type":0,"val":"enrollments","end":""},{"old":"/administrator/enrollments/export","type":0,"val":"export","end":""}],
    types: placeholder as Registry['administrator.enrollments.export']['types'],
  },
  'administrator.enrollments.show': {
    methods: ["GET","HEAD"],
    pattern: '/administrator/enrollments/:id',
    tokens: [{"old":"/administrator/enrollments/:id","type":0,"val":"administrator","end":""},{"old":"/administrator/enrollments/:id","type":0,"val":"enrollments","end":""},{"old":"/administrator/enrollments/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['administrator.enrollments.show']['types'],
  },
  'administrator.enrollments.update': {
    methods: ["PUT"],
    pattern: '/administrator/enrollments/:id',
    tokens: [{"old":"/administrator/enrollments/:id","type":0,"val":"administrator","end":""},{"old":"/administrator/enrollments/:id","type":0,"val":"enrollments","end":""},{"old":"/administrator/enrollments/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['administrator.enrollments.update']['types'],
  },
  'administrator.lifecycle.courses.archive': {
    methods: ["PATCH"],
    pattern: '/administrator/courses/:id/archive',
    tokens: [{"old":"/administrator/courses/:id/archive","type":0,"val":"administrator","end":""},{"old":"/administrator/courses/:id/archive","type":0,"val":"courses","end":""},{"old":"/administrator/courses/:id/archive","type":1,"val":"id","end":""},{"old":"/administrator/courses/:id/archive","type":0,"val":"archive","end":""}],
    types: placeholder as Registry['administrator.lifecycle.courses.archive']['types'],
  },
  'administrator.lifecycle.courses.unarchive': {
    methods: ["PATCH"],
    pattern: '/administrator/courses/:id/unarchive',
    tokens: [{"old":"/administrator/courses/:id/unarchive","type":0,"val":"administrator","end":""},{"old":"/administrator/courses/:id/unarchive","type":0,"val":"courses","end":""},{"old":"/administrator/courses/:id/unarchive","type":1,"val":"id","end":""},{"old":"/administrator/courses/:id/unarchive","type":0,"val":"unarchive","end":""}],
    types: placeholder as Registry['administrator.lifecycle.courses.unarchive']['types'],
  },
  'administrator.lifecycle.courses.purge': {
    methods: ["DELETE"],
    pattern: '/administrator/courses/:id',
    tokens: [{"old":"/administrator/courses/:id","type":0,"val":"administrator","end":""},{"old":"/administrator/courses/:id","type":0,"val":"courses","end":""},{"old":"/administrator/courses/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['administrator.lifecycle.courses.purge']['types'],
  },
  'administrator.lifecycle.classes.archive': {
    methods: ["PATCH"],
    pattern: '/administrator/classes/:id/archive',
    tokens: [{"old":"/administrator/classes/:id/archive","type":0,"val":"administrator","end":""},{"old":"/administrator/classes/:id/archive","type":0,"val":"classes","end":""},{"old":"/administrator/classes/:id/archive","type":1,"val":"id","end":""},{"old":"/administrator/classes/:id/archive","type":0,"val":"archive","end":""}],
    types: placeholder as Registry['administrator.lifecycle.classes.archive']['types'],
  },
  'administrator.lifecycle.classes.unarchive': {
    methods: ["PATCH"],
    pattern: '/administrator/classes/:id/unarchive',
    tokens: [{"old":"/administrator/classes/:id/unarchive","type":0,"val":"administrator","end":""},{"old":"/administrator/classes/:id/unarchive","type":0,"val":"classes","end":""},{"old":"/administrator/classes/:id/unarchive","type":1,"val":"id","end":""},{"old":"/administrator/classes/:id/unarchive","type":0,"val":"unarchive","end":""}],
    types: placeholder as Registry['administrator.lifecycle.classes.unarchive']['types'],
  },
  'administrator.lifecycle.classes.purge': {
    methods: ["DELETE"],
    pattern: '/administrator/classes/:id',
    tokens: [{"old":"/administrator/classes/:id","type":0,"val":"administrator","end":""},{"old":"/administrator/classes/:id","type":0,"val":"classes","end":""},{"old":"/administrator/classes/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['administrator.lifecycle.classes.purge']['types'],
  },
  'administrator.lifecycle.enrollments.archive': {
    methods: ["PATCH"],
    pattern: '/administrator/enrollments/:id/archive',
    tokens: [{"old":"/administrator/enrollments/:id/archive","type":0,"val":"administrator","end":""},{"old":"/administrator/enrollments/:id/archive","type":0,"val":"enrollments","end":""},{"old":"/administrator/enrollments/:id/archive","type":1,"val":"id","end":""},{"old":"/administrator/enrollments/:id/archive","type":0,"val":"archive","end":""}],
    types: placeholder as Registry['administrator.lifecycle.enrollments.archive']['types'],
  },
  'administrator.lifecycle.enrollments.unarchive': {
    methods: ["PATCH"],
    pattern: '/administrator/enrollments/:id/unarchive',
    tokens: [{"old":"/administrator/enrollments/:id/unarchive","type":0,"val":"administrator","end":""},{"old":"/administrator/enrollments/:id/unarchive","type":0,"val":"enrollments","end":""},{"old":"/administrator/enrollments/:id/unarchive","type":1,"val":"id","end":""},{"old":"/administrator/enrollments/:id/unarchive","type":0,"val":"unarchive","end":""}],
    types: placeholder as Registry['administrator.lifecycle.enrollments.unarchive']['types'],
  },
  'administrator.lifecycle.enrollments.purge': {
    methods: ["DELETE"],
    pattern: '/administrator/enrollments/:id',
    tokens: [{"old":"/administrator/enrollments/:id","type":0,"val":"administrator","end":""},{"old":"/administrator/enrollments/:id","type":0,"val":"enrollments","end":""},{"old":"/administrator/enrollments/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['administrator.lifecycle.enrollments.purge']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
