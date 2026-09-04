/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'authentication.sign-in': {
    methods: ["POST"]
    pattern: '/authentication/sign-in'
    types: {
      body: ExtractBody<InferInput<(typeof import('#core/validator').AuthenticationSignInValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#core/validator').AuthenticationSignInValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#features/authentication/sign-in.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/authentication/sign-in.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'authentication.sign-out': {
    methods: ["POST"]
    pattern: '/authentication/sign-out'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#features/authentication/sign-out.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/authentication/sign-out.controller').default['handle']>>>
    }
  }
  'authentication.refresh': {
    methods: ["POST"]
    pattern: '/authentication/refresh'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#features/authentication/refresh.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/authentication/refresh.controller').default['handle']>>>
    }
  }
  'authentication.invite.show': {
    methods: ["GET","HEAD"]
    pattern: '/authentication/invite/:token'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { token: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#core/validator').AuthenticationInviteShowValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#features/authentication/invite-show.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/authentication/invite-show.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'authentication.invite.accept': {
    methods: ["POST"]
    pattern: '/authentication/invite/:token'
    types: {
      body: ExtractBody<InferInput<(typeof import('#core/validator').AuthenticationInviteAcceptValidator)>>
      paramsTuple: [ParamValue]
      params: { token: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#core/validator').AuthenticationInviteAcceptValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#features/authentication/invite-accept.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/authentication/invite-accept.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'storefront.courses.paginate': {
    methods: ["GET","HEAD"]
    pattern: '/storefront/courses'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#core/validator').PaginationValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#features/storefront/courses/paginate.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/storefront/courses/paginate.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'storefront.courses.show': {
    methods: ["GET","HEAD"]
    pattern: '/storefront/courses/:slug'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#core/validator').SlugValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#features/storefront/courses/show.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/storefront/courses/show.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'storefront.faqs': {
    methods: ["GET","HEAD"]
    pattern: '/storefront/faqs'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#core/validator').PaginationValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#features/storefront/faqs/paginate.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/storefront/faqs/paginate.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'storefront.partners': {
    methods: ["GET","HEAD"]
    pattern: '/storefront/partners'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#core/validator').PaginationValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#features/storefront/partners/paginate.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/storefront/partners/paginate.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'storefront.enrollments.create': {
    methods: ["POST"]
    pattern: '/storefront/enrollments'
    types: {
      body: ExtractBody<InferInput<(typeof import('#core/validator').StorefrontEnrollmentCreateValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#core/validator').StorefrontEnrollmentCreateValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#features/storefront/enrollments/create.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/storefront/enrollments/create.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'storefront.enrollments.show': {
    methods: ["GET","HEAD"]
    pattern: '/storefront/enrollments/:protocol'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { protocol: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#core/validator').ProtocolValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#features/storefront/enrollments/show.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/storefront/enrollments/show.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'storefront.enrollments.attach': {
    methods: ["POST"]
    pattern: '/storefront/enrollments/:protocol/attachments'
    types: {
      body: ExtractBody<InferInput<(typeof import('#core/validator').StorefrontEnrollmentAttachmentValidator)>|InferInput<(typeof import('#core/validator').ProtocolValidator)>>
      paramsTuple: [ParamValue]
      params: { protocol: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#core/validator').StorefrontEnrollmentAttachmentValidator)>|InferInput<(typeof import('#core/validator').ProtocolValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#features/storefront/enrollments/attach.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/storefront/enrollments/attach.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'storefront.enrollments.pix': {
    methods: ["GET","HEAD"]
    pattern: '/storefront/enrollments/:protocol/pix'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { protocol: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#core/validator').ProtocolValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#features/storefront/enrollments/pix.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/storefront/enrollments/pix.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'storefront.enrollments.uploads.create': {
    methods: ["POST"]
    pattern: '/storefront/enrollments/:protocol/uploads'
    types: {
      body: ExtractBody<InferInput<(typeof import('#core/validator').StorageCreateValidator)>>
      paramsTuple: [ParamValue]
      params: { protocol: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#core/validator').StorageCreateValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#features/storages/create.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/storages/create.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'storefront.enrollments.uploads.complete': {
    methods: ["POST"]
    pattern: '/storefront/enrollments/:protocol/uploads/:id/complete'
    types: {
      body: ExtractBody<InferInput<(typeof import('#core/validator').StorageCompleteValidator)>|InferInput<(typeof import('#core/validator').IdentifierValidator)>>
      paramsTuple: [ParamValue, ParamValue]
      params: { protocol: ParamValue; id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#core/validator').StorageCompleteValidator)>|InferInput<(typeof import('#core/validator').IdentifierValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#features/storages/complete.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/storages/complete.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'storefront.enrollments.uploads.parts': {
    methods: ["GET","HEAD"]
    pattern: '/storefront/enrollments/:protocol/uploads/:id/parts'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { protocol: ParamValue; id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#core/validator').IdentifierValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#features/storages/parts.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/storages/parts.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'storages.create': {
    methods: ["POST"]
    pattern: '/storages'
    types: {
      body: ExtractBody<InferInput<(typeof import('#core/validator').StorageCreateValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#core/validator').StorageCreateValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#features/storages/create.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/storages/create.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'storages.complete': {
    methods: ["POST"]
    pattern: '/storages/:id/complete'
    types: {
      body: ExtractBody<InferInput<(typeof import('#core/validator').StorageCompleteValidator)>|InferInput<(typeof import('#core/validator').IdentifierValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#core/validator').StorageCompleteValidator)>|InferInput<(typeof import('#core/validator').IdentifierValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#features/storages/complete.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/storages/complete.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'storages.parts': {
    methods: ["GET","HEAD"]
    pattern: '/storages/:id/parts'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#core/validator').IdentifierValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#features/storages/parts.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/storages/parts.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'storages.delete': {
    methods: ["DELETE"]
    pattern: '/storages/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#core/validator').IdentifierValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#core/validator').IdentifierValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#features/storages/delete.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/storages/delete.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'storages.download': {
    methods: ["GET","HEAD"]
    pattern: '/storages/:id/download'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#core/validator').IdentifierValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#features/storages/download.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/storages/download.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'account.profile': {
    methods: ["GET","HEAD"]
    pattern: '/account/profile'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#features/account/show.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/account/show.controller').default['handle']>>>
    }
  }
  'account.update': {
    methods: ["PUT"]
    pattern: '/account'
    types: {
      body: ExtractBody<InferInput<(typeof import('#core/validator').AccountUpdateValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#core/validator').AccountUpdateValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#features/account/update.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/account/update.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'portal.enrollments.paginate': {
    methods: ["GET","HEAD"]
    pattern: '/portal/enrollments'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#core/validator').PaginationValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#features/portal/enrollments/paginate.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/portal/enrollments/paginate.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'portal.enrollments.show': {
    methods: ["GET","HEAD"]
    pattern: '/portal/enrollments/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#core/validator').IdentifierValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#features/portal/enrollments/show.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/portal/enrollments/show.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'administrator.courses.paginate': {
    methods: ["GET","HEAD"]
    pattern: '/administrator/courses'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#core/validator').AdministratorCoursePaginationValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#features/administrator/courses/paginate.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/administrator/courses/paginate.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'administrator.courses.create': {
    methods: ["POST"]
    pattern: '/administrator/courses'
    types: {
      body: ExtractBody<InferInput<(typeof import('#core/validator').AdministratorCourseCreateValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#core/validator').AdministratorCourseCreateValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#features/administrator/courses/create.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/administrator/courses/create.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'administrator.courses.show': {
    methods: ["GET","HEAD"]
    pattern: '/administrator/courses/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#core/validator').IdentifierValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#features/administrator/courses/show.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/administrator/courses/show.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'administrator.courses.update': {
    methods: ["PUT"]
    pattern: '/administrator/courses/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#core/validator').AdministratorCourseUpdateValidator)>|InferInput<(typeof import('#core/validator').IdentifierValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#core/validator').AdministratorCourseUpdateValidator)>|InferInput<(typeof import('#core/validator').IdentifierValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#features/administrator/courses/update.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/administrator/courses/update.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'administrator.partners.paginate': {
    methods: ["GET","HEAD"]
    pattern: '/administrator/partners'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#core/validator').AdministratorPartnerPaginationValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#features/administrator/partners/paginate.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/administrator/partners/paginate.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'administrator.partners.create': {
    methods: ["POST"]
    pattern: '/administrator/partners'
    types: {
      body: ExtractBody<InferInput<(typeof import('#core/validator').AdministratorPartnerCreateValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#core/validator').AdministratorPartnerCreateValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#features/administrator/partners/create.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/administrator/partners/create.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'administrator.partners.show': {
    methods: ["GET","HEAD"]
    pattern: '/administrator/partners/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#core/validator').IdentifierValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#features/administrator/partners/show.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/administrator/partners/show.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'administrator.partners.update': {
    methods: ["PUT"]
    pattern: '/administrator/partners/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#core/validator').AdministratorPartnerUpdateValidator)>|InferInput<(typeof import('#core/validator').IdentifierValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#core/validator').AdministratorPartnerUpdateValidator)>|InferInput<(typeof import('#core/validator').IdentifierValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#features/administrator/partners/update.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/administrator/partners/update.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'administrator.classes.paginate': {
    methods: ["GET","HEAD"]
    pattern: '/administrator/classes'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#core/validator').AdministratorClassPaginationValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#features/administrator/classes/paginate.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/administrator/classes/paginate.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'administrator.classes.create': {
    methods: ["POST"]
    pattern: '/administrator/classes'
    types: {
      body: ExtractBody<InferInput<(typeof import('#core/validator').AdministratorClassCreateValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#core/validator').AdministratorClassCreateValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#features/administrator/classes/create.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/administrator/classes/create.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'administrator.classes.show': {
    methods: ["GET","HEAD"]
    pattern: '/administrator/classes/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#core/validator').IdentifierValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#features/administrator/classes/show.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/administrator/classes/show.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'administrator.classes.update': {
    methods: ["PUT"]
    pattern: '/administrator/classes/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#core/validator').AdministratorClassUpdateValidator)>|InferInput<(typeof import('#core/validator').IdentifierValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#core/validator').AdministratorClassUpdateValidator)>|InferInput<(typeof import('#core/validator').IdentifierValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#features/administrator/classes/update.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/administrator/classes/update.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'administrator.enrollments.paginate': {
    methods: ["GET","HEAD"]
    pattern: '/administrator/enrollments'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#core/validator').AdministratorEnrollmentPaginationValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#features/administrator/enrollments/paginate.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/administrator/enrollments/paginate.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'administrator.enrollments.export': {
    methods: ["GET","HEAD"]
    pattern: '/administrator/enrollments/export'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#core/validator').AdministratorEnrollmentPaginationValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#features/administrator/enrollments/export.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/administrator/enrollments/export.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'administrator.enrollments.show': {
    methods: ["GET","HEAD"]
    pattern: '/administrator/enrollments/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#core/validator').IdentifierValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#features/administrator/enrollments/show.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/administrator/enrollments/show.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'administrator.enrollments.update': {
    methods: ["PUT"]
    pattern: '/administrator/enrollments/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#core/validator').AdministratorEnrollmentUpdateValidator)>|InferInput<(typeof import('#core/validator').IdentifierValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#core/validator').AdministratorEnrollmentUpdateValidator)>|InferInput<(typeof import('#core/validator').IdentifierValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#features/administrator/enrollments/update.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/administrator/enrollments/update.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'administrator.users.paginate': {
    methods: ["GET","HEAD"]
    pattern: '/administrator/users'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#core/validator').AdministratorUserPaginationValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#features/administrator/users/paginate.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/administrator/users/paginate.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'administrator.users.create': {
    methods: ["POST"]
    pattern: '/administrator/users'
    types: {
      body: ExtractBody<InferInput<(typeof import('#core/validator').AdministratorUserCreateValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#core/validator').AdministratorUserCreateValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#features/administrator/users/create.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/administrator/users/create.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'administrator.users.show': {
    methods: ["GET","HEAD"]
    pattern: '/administrator/users/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#core/validator').IdentifierValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#features/administrator/users/show.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/administrator/users/show.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'administrator.users.update': {
    methods: ["PUT"]
    pattern: '/administrator/users/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#core/validator').AdministratorUserUpdateValidator)>|InferInput<(typeof import('#core/validator').IdentifierValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#core/validator').AdministratorUserUpdateValidator)>|InferInput<(typeof import('#core/validator').IdentifierValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#features/administrator/users/update.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/administrator/users/update.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'administrator.users.dependents.attach': {
    methods: ["POST"]
    pattern: '/administrator/users/:id/dependents'
    types: {
      body: ExtractBody<InferInput<(typeof import('#core/validator').AdministratorGuardianshipValidator)>|InferInput<(typeof import('#core/validator').IdentifierValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#core/validator').AdministratorGuardianshipValidator)>|InferInput<(typeof import('#core/validator').IdentifierValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#features/administrator/users/attach-dependent.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/administrator/users/attach-dependent.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'administrator.users.dependents.detach': {
    methods: ["DELETE"]
    pattern: '/administrator/users/:id/dependents/:studentId'
    types: {
      body: ExtractBody<InferInput<(typeof import('#core/validator').AdministratorGuardianshipParamsValidator)>>
      paramsTuple: [ParamValue, ParamValue]
      params: { id: ParamValue; studentId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#core/validator').AdministratorGuardianshipParamsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#features/administrator/users/detach-dependent.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/administrator/users/detach-dependent.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'administrator.lifecycle.courses.archive': {
    methods: ["PATCH"]
    pattern: '/administrator/courses/:id/archive'
    types: {
      body: ExtractBody<InferInput<(typeof import('#core/validator').IdentifierValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#core/validator').IdentifierValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#features/administrator/courses/archive.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/administrator/courses/archive.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'administrator.lifecycle.courses.unarchive': {
    methods: ["PATCH"]
    pattern: '/administrator/courses/:id/unarchive'
    types: {
      body: ExtractBody<InferInput<(typeof import('#core/validator').IdentifierValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#core/validator').IdentifierValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#features/administrator/courses/unarchive.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/administrator/courses/unarchive.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'administrator.lifecycle.courses.purge': {
    methods: ["DELETE"]
    pattern: '/administrator/courses/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#core/validator').IdentifierValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#core/validator').IdentifierValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#features/administrator/courses/delete.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/administrator/courses/delete.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'administrator.lifecycle.partners.archive': {
    methods: ["PATCH"]
    pattern: '/administrator/partners/:id/archive'
    types: {
      body: ExtractBody<InferInput<(typeof import('#core/validator').IdentifierValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#core/validator').IdentifierValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#features/administrator/partners/archive.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/administrator/partners/archive.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'administrator.lifecycle.partners.unarchive': {
    methods: ["PATCH"]
    pattern: '/administrator/partners/:id/unarchive'
    types: {
      body: ExtractBody<InferInput<(typeof import('#core/validator').IdentifierValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#core/validator').IdentifierValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#features/administrator/partners/unarchive.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/administrator/partners/unarchive.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'administrator.lifecycle.partners.purge': {
    methods: ["DELETE"]
    pattern: '/administrator/partners/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#core/validator').IdentifierValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#core/validator').IdentifierValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#features/administrator/partners/delete.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/administrator/partners/delete.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'administrator.lifecycle.classes.archive': {
    methods: ["PATCH"]
    pattern: '/administrator/classes/:id/archive'
    types: {
      body: ExtractBody<InferInput<(typeof import('#core/validator').IdentifierValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#core/validator').IdentifierValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#features/administrator/classes/archive.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/administrator/classes/archive.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'administrator.lifecycle.classes.unarchive': {
    methods: ["PATCH"]
    pattern: '/administrator/classes/:id/unarchive'
    types: {
      body: ExtractBody<InferInput<(typeof import('#core/validator').IdentifierValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#core/validator').IdentifierValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#features/administrator/classes/unarchive.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/administrator/classes/unarchive.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'administrator.lifecycle.classes.purge': {
    methods: ["DELETE"]
    pattern: '/administrator/classes/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#core/validator').IdentifierValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#core/validator').IdentifierValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#features/administrator/classes/delete.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/administrator/classes/delete.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'administrator.lifecycle.enrollments.archive': {
    methods: ["PATCH"]
    pattern: '/administrator/enrollments/:id/archive'
    types: {
      body: ExtractBody<InferInput<(typeof import('#core/validator').IdentifierValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#core/validator').IdentifierValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#features/administrator/enrollments/archive.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/administrator/enrollments/archive.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'administrator.lifecycle.enrollments.unarchive': {
    methods: ["PATCH"]
    pattern: '/administrator/enrollments/:id/unarchive'
    types: {
      body: ExtractBody<InferInput<(typeof import('#core/validator').IdentifierValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#core/validator').IdentifierValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#features/administrator/enrollments/unarchive.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/administrator/enrollments/unarchive.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'administrator.lifecycle.enrollments.purge': {
    methods: ["DELETE"]
    pattern: '/administrator/enrollments/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#core/validator').IdentifierValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#core/validator').IdentifierValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#features/administrator/enrollments/delete.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/administrator/enrollments/delete.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'administrator.lifecycle.users.archive': {
    methods: ["PATCH"]
    pattern: '/administrator/users/:id/archive'
    types: {
      body: ExtractBody<InferInput<(typeof import('#core/validator').IdentifierValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#core/validator').IdentifierValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#features/administrator/users/archive.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/administrator/users/archive.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'administrator.lifecycle.users.unarchive': {
    methods: ["PATCH"]
    pattern: '/administrator/users/:id/unarchive'
    types: {
      body: ExtractBody<InferInput<(typeof import('#core/validator').IdentifierValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#core/validator').IdentifierValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#features/administrator/users/unarchive.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/administrator/users/unarchive.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'administrator.lifecycle.users.purge': {
    methods: ["DELETE"]
    pattern: '/administrator/users/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#core/validator').IdentifierValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#core/validator').IdentifierValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#features/administrator/users/delete.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#features/administrator/users/delete.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
}
