/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  authentication: {
    signIn: typeof routes['authentication.sign-in']
    signOut: typeof routes['authentication.sign-out']
    invite: {
      show: typeof routes['authentication.invite.show']
      accept: typeof routes['authentication.invite.accept']
    }
  }
  storefront: {
    courses: {
      paginate: typeof routes['storefront.courses.paginate']
      show: typeof routes['storefront.courses.show']
    }
    faqs: typeof routes['storefront.faqs']
    enrollments: {
      create: typeof routes['storefront.enrollments.create']
      show: typeof routes['storefront.enrollments.show']
      attach: typeof routes['storefront.enrollments.attach']
      uploads: {
        create: typeof routes['storefront.enrollments.uploads.create']
        complete: typeof routes['storefront.enrollments.uploads.complete']
        parts: typeof routes['storefront.enrollments.uploads.parts']
      }
    }
  }
  storages: {
    create: typeof routes['storages.create']
    complete: typeof routes['storages.complete']
    parts: typeof routes['storages.parts']
    delete: typeof routes['storages.delete']
    download: typeof routes['storages.download']
  }
  account: {
    profile: typeof routes['account.profile']
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
    users: {
      paginate: typeof routes['administrator.users.paginate']
      create: typeof routes['administrator.users.create']
      show: typeof routes['administrator.users.show']
      update: typeof routes['administrator.users.update']
      dependents: {
        attach: typeof routes['administrator.users.dependents.attach']
        detach: typeof routes['administrator.users.dependents.detach']
      }
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
      users: {
        archive: typeof routes['administrator.lifecycle.users.archive']
        unarchive: typeof routes['administrator.lifecycle.users.unarchive']
        purge: typeof routes['administrator.lifecycle.users.purge']
      }
    }
  }
}
