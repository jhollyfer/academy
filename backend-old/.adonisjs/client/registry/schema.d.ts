/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'list_courses': {
    methods: ["GET","HEAD"]
    pattern: '/api/courses'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#resources/courses/list/list.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#resources/courses/list/list.controller').default['handle']>>>
    }
  }
  'list_modules': {
    methods: ["GET","HEAD"]
    pattern: '/api/courses/:courseSlug/modules'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { courseSlug: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#resources/courses/modules/modules.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#resources/courses/modules/modules.controller').default['handle']>>>
    }
  }
  'list_lessons': {
    methods: ["GET","HEAD"]
    pattern: '/api/courses/:courseSlug/lessons'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { courseSlug: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#resources/lessons/list/list.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#resources/lessons/list/list.controller').default['handle']>>>
    }
  }
  'lesson_quiz_questions': {
    methods: ["GET","HEAD"]
    pattern: '/api/courses/:courseSlug/lessons/:lessonSlug/quiz-questions'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { courseSlug: ParamValue; lessonSlug: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#resources/quiz/lesson-questions/lesson-questions.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#resources/quiz/lesson-questions/lesson-questions.controller').default['handle']>>>
    }
  }
  'show_lesson': {
    methods: ["GET","HEAD"]
    pattern: '/api/courses/:courseSlug/lessons/:lessonSlug'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { courseSlug: ParamValue; lessonSlug: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#resources/lessons/show/show.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#resources/lessons/show/show.controller').default['handle']>>>
    }
  }
  'module_quiz_questions': {
    methods: ["GET","HEAD"]
    pattern: '/api/courses/:courseSlug/modules/:moduleName/quiz-questions'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { courseSlug: ParamValue; moduleName: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#resources/quiz/module-questions/module-questions.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#resources/quiz/module-questions/module-questions.controller').default['handle']>>>
    }
  }
  'quiz_questions': {
    methods: ["GET","HEAD"]
    pattern: '/api/courses/:courseSlug/quiz-questions'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { courseSlug: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#resources/quiz/questions/questions.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#resources/quiz/questions/questions.controller').default['handle']>>>
    }
  }
}
