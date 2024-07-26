import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { dayjs } from '../lib/dayjs'
import { ClientError } from '../errors/client-error'

export async function createActivity(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/trips/:tripId/activities',
    {
      schema: {
        params: z.object({
          tripId: z.string().uuid(),
        }),
        body: z.object({
          title: z.string().min(4),
          occurs_at: z.string().transform((val) => new Date(val)), // Melhor manipulação de data
        }),
      },
    },
    async (request, reply) => {
      const { tripId } = request.params
      const { title, occurs_at } = request.body

      const trip = await prisma.trip.findUnique({
        where: { id: tripId }
      })

      if (!trip) {
        throw new ClientError('Trip not found')
      }

      const activityDate = dayjs(occurs_at)

      if (activityDate.isBefore(trip.starts_at)) {
        throw new ClientError('Activity date cannot be before the trip start date.')
      }

      if (activityDate.isAfter(trip.ends_at)) {
        throw new ClientError('Activity date cannot be after the trip end date.')
      }

      const activity = await prisma.activity.create({
        data: {
          title,
          occurs_at: activityDate.toDate(), // Salva a data no formato correto
          trip_id: tripId,
        }
      })

      return reply.status(201).send({
        activityId: activity.id,
        title: activity.title,
        occurs_at: activity.occurs_at,
      })
    },
  )
}
