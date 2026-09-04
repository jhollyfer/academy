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
  'authentication.refresh': {
    methods: ["POST"],
    pattern: '/authentication/refresh',
    tokens: [{"old":"/authentication/refresh","type":0,"val":"authentication","end":""},{"old":"/authentication/refresh","type":0,"val":"refresh","end":""}],
    types: placeholder as Registry['authentication.refresh']['types'],
  },
  'authentication.invite.show': {
    methods: ["GET","HEAD"],
    pattern: '/authentication/invite/:token',
    tokens: [{"old":"/authentication/invite/:token","type":0,"val":"authentication","end":""},{"old":"/authentication/invite/:token","type":0,"val":"invite","end":""},{"old":"/authentication/invite/:token","type":1,"val":"token","end":""}],
    types: placeholder as Registry['authentication.invite.show']['types'],
  },
  'authentication.invite.accept': {
    methods: ["POST"],
    pattern: '/authentication/invite/:token',
    tokens: [{"old":"/authentication/invite/:token","type":0,"val":"authentication","end":""},{"old":"/authentication/invite/:token","type":0,"val":"invite","end":""},{"old":"/authentication/invite/:token","type":1,"val":"token","end":""}],
    types: placeholder as Registry['authentication.invite.accept']['types'],
  },
  'storefront.courses.paginate': {
    methods: ["GET","HEAD"],
    pattern: '/storefront/courses',
    tokens: [{"old":"/storefront/courses","type":0,"val":"storefront","end":""},{"old":"/storefront/courses","type":0,"val":"courses","end":""}],
    types: placeholder as Registry['storefront.courses.paginate']['types'],
  },
  'storefront.courses.show': {
    methods: ["GET","HEAD"],
    pattern: '/storefront/courses/:slug',
    tokens: [{"old":"/storefront/courses/:slug","type":0,"val":"storefront","end":""},{"old":"/storefront/courses/:slug","type":0,"val":"courses","end":""},{"old":"/storefront/courses/:slug","type":1,"val":"slug","end":""}],
    types: placeholder as Registry['storefront.courses.show']['types'],
  },
  'storefront.faqs': {
    methods: ["GET","HEAD"],
    pattern: '/storefront/faqs',
    tokens: [{"old":"/storefront/faqs","type":0,"val":"storefront","end":""},{"old":"/storefront/faqs","type":0,"val":"faqs","end":""}],
    types: placeholder as Registry['storefront.faqs']['types'],
  },
  'storefront.partners': {
    methods: ["GET","HEAD"],
    pattern: '/storefront/partners',
    tokens: [{"old":"/storefront/partners","type":0,"val":"storefront","end":""},{"old":"/storefront/partners","type":0,"val":"partners","end":""}],
    types: placeholder as Registry['storefront.partners']['types'],
  },
  'storefront.photos': {
    methods: ["GET","HEAD"],
    pattern: '/storefront/photos',
    tokens: [{"old":"/storefront/photos","type":0,"val":"storefront","end":""},{"old":"/storefront/photos","type":0,"val":"photos","end":""}],
    types: placeholder as Registry['storefront.photos']['types'],
  },
  'storefront.enrollments.create': {
    methods: ["POST"],
    pattern: '/storefront/enrollments',
    tokens: [{"old":"/storefront/enrollments","type":0,"val":"storefront","end":""},{"old":"/storefront/enrollments","type":0,"val":"enrollments","end":""}],
    types: placeholder as Registry['storefront.enrollments.create']['types'],
  },
  'storefront.enrollments.show': {
    methods: ["GET","HEAD"],
    pattern: '/storefront/enrollments/:protocol',
    tokens: [{"old":"/storefront/enrollments/:protocol","type":0,"val":"storefront","end":""},{"old":"/storefront/enrollments/:protocol","type":0,"val":"enrollments","end":""},{"old":"/storefront/enrollments/:protocol","type":1,"val":"protocol","end":""}],
    types: placeholder as Registry['storefront.enrollments.show']['types'],
  },
  'storefront.enrollments.attach': {
    methods: ["POST"],
    pattern: '/storefront/enrollments/:protocol/attachments',
    tokens: [{"old":"/storefront/enrollments/:protocol/attachments","type":0,"val":"storefront","end":""},{"old":"/storefront/enrollments/:protocol/attachments","type":0,"val":"enrollments","end":""},{"old":"/storefront/enrollments/:protocol/attachments","type":1,"val":"protocol","end":""},{"old":"/storefront/enrollments/:protocol/attachments","type":0,"val":"attachments","end":""}],
    types: placeholder as Registry['storefront.enrollments.attach']['types'],
  },
  'storefront.enrollments.pix': {
    methods: ["GET","HEAD"],
    pattern: '/storefront/enrollments/:protocol/pix',
    tokens: [{"old":"/storefront/enrollments/:protocol/pix","type":0,"val":"storefront","end":""},{"old":"/storefront/enrollments/:protocol/pix","type":0,"val":"enrollments","end":""},{"old":"/storefront/enrollments/:protocol/pix","type":1,"val":"protocol","end":""},{"old":"/storefront/enrollments/:protocol/pix","type":0,"val":"pix","end":""}],
    types: placeholder as Registry['storefront.enrollments.pix']['types'],
  },
  'storefront.enrollments.uploads.create': {
    methods: ["POST"],
    pattern: '/storefront/enrollments/:protocol/uploads',
    tokens: [{"old":"/storefront/enrollments/:protocol/uploads","type":0,"val":"storefront","end":""},{"old":"/storefront/enrollments/:protocol/uploads","type":0,"val":"enrollments","end":""},{"old":"/storefront/enrollments/:protocol/uploads","type":1,"val":"protocol","end":""},{"old":"/storefront/enrollments/:protocol/uploads","type":0,"val":"uploads","end":""}],
    types: placeholder as Registry['storefront.enrollments.uploads.create']['types'],
  },
  'storefront.enrollments.uploads.complete': {
    methods: ["POST"],
    pattern: '/storefront/enrollments/:protocol/uploads/:id/complete',
    tokens: [{"old":"/storefront/enrollments/:protocol/uploads/:id/complete","type":0,"val":"storefront","end":""},{"old":"/storefront/enrollments/:protocol/uploads/:id/complete","type":0,"val":"enrollments","end":""},{"old":"/storefront/enrollments/:protocol/uploads/:id/complete","type":1,"val":"protocol","end":""},{"old":"/storefront/enrollments/:protocol/uploads/:id/complete","type":0,"val":"uploads","end":""},{"old":"/storefront/enrollments/:protocol/uploads/:id/complete","type":1,"val":"id","end":""},{"old":"/storefront/enrollments/:protocol/uploads/:id/complete","type":0,"val":"complete","end":""}],
    types: placeholder as Registry['storefront.enrollments.uploads.complete']['types'],
  },
  'storefront.enrollments.uploads.parts': {
    methods: ["GET","HEAD"],
    pattern: '/storefront/enrollments/:protocol/uploads/:id/parts',
    tokens: [{"old":"/storefront/enrollments/:protocol/uploads/:id/parts","type":0,"val":"storefront","end":""},{"old":"/storefront/enrollments/:protocol/uploads/:id/parts","type":0,"val":"enrollments","end":""},{"old":"/storefront/enrollments/:protocol/uploads/:id/parts","type":1,"val":"protocol","end":""},{"old":"/storefront/enrollments/:protocol/uploads/:id/parts","type":0,"val":"uploads","end":""},{"old":"/storefront/enrollments/:protocol/uploads/:id/parts","type":1,"val":"id","end":""},{"old":"/storefront/enrollments/:protocol/uploads/:id/parts","type":0,"val":"parts","end":""}],
    types: placeholder as Registry['storefront.enrollments.uploads.parts']['types'],
  },
  'storages.create': {
    methods: ["POST"],
    pattern: '/storages',
    tokens: [{"old":"/storages","type":0,"val":"storages","end":""}],
    types: placeholder as Registry['storages.create']['types'],
  },
  'storages.complete': {
    methods: ["POST"],
    pattern: '/storages/:id/complete',
    tokens: [{"old":"/storages/:id/complete","type":0,"val":"storages","end":""},{"old":"/storages/:id/complete","type":1,"val":"id","end":""},{"old":"/storages/:id/complete","type":0,"val":"complete","end":""}],
    types: placeholder as Registry['storages.complete']['types'],
  },
  'storages.parts': {
    methods: ["GET","HEAD"],
    pattern: '/storages/:id/parts',
    tokens: [{"old":"/storages/:id/parts","type":0,"val":"storages","end":""},{"old":"/storages/:id/parts","type":1,"val":"id","end":""},{"old":"/storages/:id/parts","type":0,"val":"parts","end":""}],
    types: placeholder as Registry['storages.parts']['types'],
  },
  'storages.delete': {
    methods: ["DELETE"],
    pattern: '/storages/:id',
    tokens: [{"old":"/storages/:id","type":0,"val":"storages","end":""},{"old":"/storages/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['storages.delete']['types'],
  },
  'storages.download': {
    methods: ["GET","HEAD"],
    pattern: '/storages/:id/download',
    tokens: [{"old":"/storages/:id/download","type":0,"val":"storages","end":""},{"old":"/storages/:id/download","type":1,"val":"id","end":""},{"old":"/storages/:id/download","type":0,"val":"download","end":""}],
    types: placeholder as Registry['storages.download']['types'],
  },
  'account.profile': {
    methods: ["GET","HEAD"],
    pattern: '/account/profile',
    tokens: [{"old":"/account/profile","type":0,"val":"account","end":""},{"old":"/account/profile","type":0,"val":"profile","end":""}],
    types: placeholder as Registry['account.profile']['types'],
  },
  'account.update': {
    methods: ["PUT"],
    pattern: '/account',
    tokens: [{"old":"/account","type":0,"val":"account","end":""}],
    types: placeholder as Registry['account.update']['types'],
  },
  'portal.enrollments.paginate': {
    methods: ["GET","HEAD"],
    pattern: '/portal/enrollments',
    tokens: [{"old":"/portal/enrollments","type":0,"val":"portal","end":""},{"old":"/portal/enrollments","type":0,"val":"enrollments","end":""}],
    types: placeholder as Registry['portal.enrollments.paginate']['types'],
  },
  'portal.enrollments.show': {
    methods: ["GET","HEAD"],
    pattern: '/portal/enrollments/:id',
    tokens: [{"old":"/portal/enrollments/:id","type":0,"val":"portal","end":""},{"old":"/portal/enrollments/:id","type":0,"val":"enrollments","end":""},{"old":"/portal/enrollments/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['portal.enrollments.show']['types'],
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
  'administrator.photos.paginate': {
    methods: ["GET","HEAD"],
    pattern: '/administrator/photos',
    tokens: [{"old":"/administrator/photos","type":0,"val":"administrator","end":""},{"old":"/administrator/photos","type":0,"val":"photos","end":""}],
    types: placeholder as Registry['administrator.photos.paginate']['types'],
  },
  'administrator.photos.create': {
    methods: ["POST"],
    pattern: '/administrator/photos',
    tokens: [{"old":"/administrator/photos","type":0,"val":"administrator","end":""},{"old":"/administrator/photos","type":0,"val":"photos","end":""}],
    types: placeholder as Registry['administrator.photos.create']['types'],
  },
  'administrator.photos.show': {
    methods: ["GET","HEAD"],
    pattern: '/administrator/photos/:id',
    tokens: [{"old":"/administrator/photos/:id","type":0,"val":"administrator","end":""},{"old":"/administrator/photos/:id","type":0,"val":"photos","end":""},{"old":"/administrator/photos/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['administrator.photos.show']['types'],
  },
  'administrator.photos.update': {
    methods: ["PUT"],
    pattern: '/administrator/photos/:id',
    tokens: [{"old":"/administrator/photos/:id","type":0,"val":"administrator","end":""},{"old":"/administrator/photos/:id","type":0,"val":"photos","end":""},{"old":"/administrator/photos/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['administrator.photos.update']['types'],
  },
  'administrator.partners.paginate': {
    methods: ["GET","HEAD"],
    pattern: '/administrator/partners',
    tokens: [{"old":"/administrator/partners","type":0,"val":"administrator","end":""},{"old":"/administrator/partners","type":0,"val":"partners","end":""}],
    types: placeholder as Registry['administrator.partners.paginate']['types'],
  },
  'administrator.partners.create': {
    methods: ["POST"],
    pattern: '/administrator/partners',
    tokens: [{"old":"/administrator/partners","type":0,"val":"administrator","end":""},{"old":"/administrator/partners","type":0,"val":"partners","end":""}],
    types: placeholder as Registry['administrator.partners.create']['types'],
  },
  'administrator.partners.show': {
    methods: ["GET","HEAD"],
    pattern: '/administrator/partners/:id',
    tokens: [{"old":"/administrator/partners/:id","type":0,"val":"administrator","end":""},{"old":"/administrator/partners/:id","type":0,"val":"partners","end":""},{"old":"/administrator/partners/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['administrator.partners.show']['types'],
  },
  'administrator.partners.update': {
    methods: ["PUT"],
    pattern: '/administrator/partners/:id',
    tokens: [{"old":"/administrator/partners/:id","type":0,"val":"administrator","end":""},{"old":"/administrator/partners/:id","type":0,"val":"partners","end":""},{"old":"/administrator/partners/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['administrator.partners.update']['types'],
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
  'administrator.users.paginate': {
    methods: ["GET","HEAD"],
    pattern: '/administrator/users',
    tokens: [{"old":"/administrator/users","type":0,"val":"administrator","end":""},{"old":"/administrator/users","type":0,"val":"users","end":""}],
    types: placeholder as Registry['administrator.users.paginate']['types'],
  },
  'administrator.users.create': {
    methods: ["POST"],
    pattern: '/administrator/users',
    tokens: [{"old":"/administrator/users","type":0,"val":"administrator","end":""},{"old":"/administrator/users","type":0,"val":"users","end":""}],
    types: placeholder as Registry['administrator.users.create']['types'],
  },
  'administrator.users.show': {
    methods: ["GET","HEAD"],
    pattern: '/administrator/users/:id',
    tokens: [{"old":"/administrator/users/:id","type":0,"val":"administrator","end":""},{"old":"/administrator/users/:id","type":0,"val":"users","end":""},{"old":"/administrator/users/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['administrator.users.show']['types'],
  },
  'administrator.users.update': {
    methods: ["PUT"],
    pattern: '/administrator/users/:id',
    tokens: [{"old":"/administrator/users/:id","type":0,"val":"administrator","end":""},{"old":"/administrator/users/:id","type":0,"val":"users","end":""},{"old":"/administrator/users/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['administrator.users.update']['types'],
  },
  'administrator.users.dependents.attach': {
    methods: ["POST"],
    pattern: '/administrator/users/:id/dependents',
    tokens: [{"old":"/administrator/users/:id/dependents","type":0,"val":"administrator","end":""},{"old":"/administrator/users/:id/dependents","type":0,"val":"users","end":""},{"old":"/administrator/users/:id/dependents","type":1,"val":"id","end":""},{"old":"/administrator/users/:id/dependents","type":0,"val":"dependents","end":""}],
    types: placeholder as Registry['administrator.users.dependents.attach']['types'],
  },
  'administrator.users.dependents.detach': {
    methods: ["DELETE"],
    pattern: '/administrator/users/:id/dependents/:studentId',
    tokens: [{"old":"/administrator/users/:id/dependents/:studentId","type":0,"val":"administrator","end":""},{"old":"/administrator/users/:id/dependents/:studentId","type":0,"val":"users","end":""},{"old":"/administrator/users/:id/dependents/:studentId","type":1,"val":"id","end":""},{"old":"/administrator/users/:id/dependents/:studentId","type":0,"val":"dependents","end":""},{"old":"/administrator/users/:id/dependents/:studentId","type":1,"val":"studentId","end":""}],
    types: placeholder as Registry['administrator.users.dependents.detach']['types'],
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
  'administrator.lifecycle.photos.archive': {
    methods: ["PATCH"],
    pattern: '/administrator/photos/:id/archive',
    tokens: [{"old":"/administrator/photos/:id/archive","type":0,"val":"administrator","end":""},{"old":"/administrator/photos/:id/archive","type":0,"val":"photos","end":""},{"old":"/administrator/photos/:id/archive","type":1,"val":"id","end":""},{"old":"/administrator/photos/:id/archive","type":0,"val":"archive","end":""}],
    types: placeholder as Registry['administrator.lifecycle.photos.archive']['types'],
  },
  'administrator.lifecycle.photos.unarchive': {
    methods: ["PATCH"],
    pattern: '/administrator/photos/:id/unarchive',
    tokens: [{"old":"/administrator/photos/:id/unarchive","type":0,"val":"administrator","end":""},{"old":"/administrator/photos/:id/unarchive","type":0,"val":"photos","end":""},{"old":"/administrator/photos/:id/unarchive","type":1,"val":"id","end":""},{"old":"/administrator/photos/:id/unarchive","type":0,"val":"unarchive","end":""}],
    types: placeholder as Registry['administrator.lifecycle.photos.unarchive']['types'],
  },
  'administrator.lifecycle.photos.purge': {
    methods: ["DELETE"],
    pattern: '/administrator/photos/:id',
    tokens: [{"old":"/administrator/photos/:id","type":0,"val":"administrator","end":""},{"old":"/administrator/photos/:id","type":0,"val":"photos","end":""},{"old":"/administrator/photos/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['administrator.lifecycle.photos.purge']['types'],
  },
  'administrator.lifecycle.partners.archive': {
    methods: ["PATCH"],
    pattern: '/administrator/partners/:id/archive',
    tokens: [{"old":"/administrator/partners/:id/archive","type":0,"val":"administrator","end":""},{"old":"/administrator/partners/:id/archive","type":0,"val":"partners","end":""},{"old":"/administrator/partners/:id/archive","type":1,"val":"id","end":""},{"old":"/administrator/partners/:id/archive","type":0,"val":"archive","end":""}],
    types: placeholder as Registry['administrator.lifecycle.partners.archive']['types'],
  },
  'administrator.lifecycle.partners.unarchive': {
    methods: ["PATCH"],
    pattern: '/administrator/partners/:id/unarchive',
    tokens: [{"old":"/administrator/partners/:id/unarchive","type":0,"val":"administrator","end":""},{"old":"/administrator/partners/:id/unarchive","type":0,"val":"partners","end":""},{"old":"/administrator/partners/:id/unarchive","type":1,"val":"id","end":""},{"old":"/administrator/partners/:id/unarchive","type":0,"val":"unarchive","end":""}],
    types: placeholder as Registry['administrator.lifecycle.partners.unarchive']['types'],
  },
  'administrator.lifecycle.partners.purge': {
    methods: ["DELETE"],
    pattern: '/administrator/partners/:id',
    tokens: [{"old":"/administrator/partners/:id","type":0,"val":"administrator","end":""},{"old":"/administrator/partners/:id","type":0,"val":"partners","end":""},{"old":"/administrator/partners/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['administrator.lifecycle.partners.purge']['types'],
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
  'administrator.lifecycle.users.archive': {
    methods: ["PATCH"],
    pattern: '/administrator/users/:id/archive',
    tokens: [{"old":"/administrator/users/:id/archive","type":0,"val":"administrator","end":""},{"old":"/administrator/users/:id/archive","type":0,"val":"users","end":""},{"old":"/administrator/users/:id/archive","type":1,"val":"id","end":""},{"old":"/administrator/users/:id/archive","type":0,"val":"archive","end":""}],
    types: placeholder as Registry['administrator.lifecycle.users.archive']['types'],
  },
  'administrator.lifecycle.users.unarchive': {
    methods: ["PATCH"],
    pattern: '/administrator/users/:id/unarchive',
    tokens: [{"old":"/administrator/users/:id/unarchive","type":0,"val":"administrator","end":""},{"old":"/administrator/users/:id/unarchive","type":0,"val":"users","end":""},{"old":"/administrator/users/:id/unarchive","type":1,"val":"id","end":""},{"old":"/administrator/users/:id/unarchive","type":0,"val":"unarchive","end":""}],
    types: placeholder as Registry['administrator.lifecycle.users.unarchive']['types'],
  },
  'administrator.lifecycle.users.purge': {
    methods: ["DELETE"],
    pattern: '/administrator/users/:id',
    tokens: [{"old":"/administrator/users/:id","type":0,"val":"administrator","end":""},{"old":"/administrator/users/:id","type":0,"val":"users","end":""},{"old":"/administrator/users/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['administrator.lifecycle.users.purge']['types'],
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
