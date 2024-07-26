import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import nodemailer from 'nodemailer'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { getMailClient } from '../lib/mail'
import { dayjs } from '../lib/dayjs'
import { ClientError } from '../errors/client-error'
import { env } from '../env'

export async function createTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/trips',
    {
      schema: {
        body: z.object({
          destination: z.string().min(4),
          starts_at: z.string().refine((value) => dayjs(value).isValid(), {
            message: 'Invalid starts_at date format. Expected ISO 8601 date format.',
          }),
          ends_at: z.string().refine((value) => dayjs(value).isValid(), {
            message: 'Invalid ends_at date format. Expected ISO 8601 date format.',
          }),
          owner_name: z.string(),
          owner_email: z.string().email(),
          emails_to_invite: z.array(z.string().email()),
        }),
      },
    },
    async (request) => {
      const {
        destination,
        starts_at,
        ends_at,
        owner_name,
        owner_email,
        emails_to_invite,
      } = request.body

      // Validar datas
      if (!dayjs(starts_at).isValid()) {
        throw new ClientError('Invalid trip start date format.')
      }

      if (!dayjs(ends_at).isValid()) {
        throw new ClientError('Invalid trip end date format.')
      }

      // Criar viagem no banco de dados
      const trip = await prisma.trip.create({
        data: {
          destination,
          starts_at: new Date(starts_at), // Converter string para Date
          ends_at: new Date(ends_at), // Converter string para Date
          participants: {
            createMany: {
              data: [
                {
                  name: owner_name,
                  email: owner_email,
                  is_owner: true,
                  is_confirmed: true,
                },
                ...emails_to_invite.map((email) => ({ email })),
              ],
            },
          },
        },
      })

      // Formatar datas para exibição
      const formattedStartDate = dayjs(starts_at).format('LL')
      const formattedEndDate = dayjs(ends_at).format('LL')

      // Construir link de confirmação da viagem
      const confirmationLink = `${env.API_BASE_URL}/trips/${trip.id}/confirm`

      try {
        // Enviar e-mail de confirmação
        const mail = await getMailClient()

        const message = await mail.sendMail({
          from: {
            name: 'Equipe plann.er',
            address: 'oi@plann.er',
          },
          to: {
            name: owner_name,
            address: owner_email,
          },
          subject: `Confirme sua viagem para ${destination} em ${formattedStartDate}`,
          html: `
          <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
            <p>Você solicitou a criação de uma viagem para <strong>${destination}</strong> nas datas de <strong>${formattedStartDate}</strong> até <strong>${formattedEndDate}</strong>.</p>
            <p></p>
            <p>Para confirmar sua viagem, clique no link abaixo:</p>
            <p></p>
            <p>
              <a href="${confirmationLink}">Confirmar viagem</a>
            </p>
            <p></p>
            <p>Caso você não saiba do que se trata esse e-mail, apenas ignore esse e-mail.</p>
          </div>
        `.trim(),
        })

        console.log('URL do teste de mensagem:', nodemailer.getTestMessageUrl(message)) // URL de teste de mensagem

        return { tripId: trip.id }
      } catch (error) {
        console.error('Erro ao enviar e-mail:', error) // Logar erro ao enviar e-mail
        throw new ClientError('Error sending confirmation email.')
      }
    },
  )
}
