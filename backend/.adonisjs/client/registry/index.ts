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
