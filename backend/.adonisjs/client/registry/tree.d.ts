/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  authentication: {
    signIn: typeof routes['authentication.sign-in']
    signOut: typeof routes['authentication.sign-out']
  }
  administrator: {
    courses: {
      paginate: typeof routes['administrator.courses.paginate']
      create: typeof routes['administrator.courses.create']
      show: typeof routes['administrator.courses.show']
      update: typeof routes['administrator.courses.update']
    }
    classes: {
      paginate: typeof routes['administrator.classes.paginate']
      create: typeof routes['administrator.classes.create']
      show: typeof routes['administrator.classes.show']
      update: typeof routes['administrator.classes.update']
    }
    enrollments: {
      paginate: typeof routes['administrator.enrollments.paginate']
      export: typeof routes['administrator.enrollments.export']
      show: typeof routes['administrator.enrollments.show']
      update: typeof routes['administrator.enrollments.update']
    }
    lifecycle: {
      courses: {
        archive: typeof routes['administrator.lifecycle.courses.archive']
        unarchive: typeof routes['administrator.lifecycle.courses.unarchive']
        purge: typeof routes['administrator.lifecycle.courses.purge']
      }
      classes: {
        archive: typeof routes['administrator.lifecycle.classes.archive']
        unarchive: typeof routes['administrator.lifecycle.classes.unarchive']
        purge: typeof routes['administrator.lifecycle.classes.purge']
      }
      enrollments: {
        archive: typeof routes['administrator.lifecycle.enrollments.archive']
        unarchive: typeof routes['administrator.lifecycle.enrollments.unarchive']
        purge: typeof routes['administrator.lifecycle.enrollments.purge']
      }
    }
  }
}
