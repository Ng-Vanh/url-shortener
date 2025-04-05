// This is a mock database implementation for demonstration purposes
// In a real application, you would use a real database like PostgreSQL with Prisma

class Database {
  private urls: any[] = []

  url = {
    create: async ({ data }: { data: any }) => {
      const newUrl = {
        id: `url_${this.urls.length + 1}`,
        ...data,
        createdAt: new Date().toISOString(),
      }
      this.urls.push(newUrl)
      return newUrl
    },

    findMany: async ({ where, orderBy }: { where?: any; orderBy?: any }) => {
      let results = [...this.urls]

      if (where) {
        if (where.userId) {
          results = results.filter((url) => url.userId === where.userId)
        }
        if (where.id?.in) {
          results = results.filter((url) => where.id.in.includes(url.id))
        }
      }

      if (orderBy?.createdAt === "desc") {
        results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      }

      return results
    },

    findFirst: async ({ where, orderBy }: { where?: any; orderBy?: any }) => {
      let results = [...this.urls]

      if (where) {
        if (where.userId) {
          results = results.filter((url) => url.userId === where.userId)
        }
        if (where.id) {
          results = results.filter((url) => url.id === where.id)
        }
      }

      if (orderBy?.createdAt === "desc") {
        results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      }

      return results[0] || null
    },

    findUnique: async ({ where }: { where: any }) => {
      if (where.shortCode) {
        return this.urls.find((url) => url.shortCode === where.shortCode) || null
      }
      return null
    },

    update: async ({ where, data }: { where: any; data: any }) => {
      const urlIndex = this.urls.findIndex((url) => url.shortCode === where.shortCode)

      if (urlIndex !== -1) {
        if (data.clicks?.increment) {
          this.urls[urlIndex].clicks += data.clicks.increment
        }
        return this.urls[urlIndex]
      }

      return null
    },

    delete: async ({ where }: { where: any }) => {
      const urlIndex = this.urls.findIndex((url) => {
        if (where.id && where.userId) {
          return url.id === where.id && url.userId === where.userId
        }
        return url.id === where.id
      })

      if (urlIndex !== -1) {
        const deletedUrl = this.urls[urlIndex]
        this.urls.splice(urlIndex, 1)
        return deletedUrl
      }

      return null
    },
  }
}

export const db = new Database()

