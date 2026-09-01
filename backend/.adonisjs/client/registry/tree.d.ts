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
    lifecycle: {
      courses: {
        archive: typeof routes['administrator.lifecycle.courses.archive']
        unarchive: typeof routes['administrator.lifecycle.courses.unarchive']
        purge: typeof routes['administrator.lifecycle.courses.purge']
      }
    }
  }
}
