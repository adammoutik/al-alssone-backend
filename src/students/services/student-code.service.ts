import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Student } from '../entities/student.entity';
import { RateLimiterMemory } from 'rate-limiter-flexible';

@Injectable()
export class StudentCodeService {
  private readonly rateLimiter: RateLimiterMemory;

  constructor(
    @InjectModel(Student.name) private studentModel: Model<Student>,
  ) {
    // Limite de 5 tentatives par IP toutes les 15 minutes
    this.rateLimiter = new RateLimiterMemory({
      points: 5,
      duration: 15 * 60, // 15 minutes
    });
  }

  private generateRandomCode(): string {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    
    // Générer 2 lettres aléatoires
    let code = '';
    for (let i = 0; i < 2; i++) {
      code += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    
    // Générer 7 chiffres aléatoires
    for (let i = 0; i < 7; i++) {
      code += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    
    return code;
  }

  async generateUniqueStudentCode(): Promise<string> {
    let code = this.generateRandomCode();
    let isUnique = false;

    while (!isUnique) {
      const existingStudent = await this.studentModel.findOne({ studentCode: code });
      if (!existingStudent) {
        isUnique = true;
      } else {
        code = this.generateRandomCode();
      }
    }

    return code;
  }

  async validateRateLimit(ip: string): Promise<boolean> {
    try {
      await this.rateLimiter.consume(ip);
      return true;
    } catch (error) {
      return false;
    }
  }

  async getStudentPaymentsByCode(studentCode: string, ip: string) {
    // Vérifier le rate limiting
    const isAllowed = await this.validateRateLimit(ip);
    if (!isAllowed) {
      throw new Error('Too many attempts. Please try again later.');
    }

    // Vérifier si le code étudiant existe
    const student = await this.studentModel.findOne({ studentCode });
    if (!student) {
      throw new Error('Invalid student code');
    }

    // Retourner l'historique des paiements avec les détails des frais
    return this.studentModel.aggregate([
      { $match: { studentCode } },
      {
        $lookup: {
          from: 'payments',
          localField: '_id',
          foreignField: 'studentId',
          as: 'payments'
        }
      },
      {
        $lookup: {
          from: 'fees',
          localField: 'payments.feeId',
          foreignField: '_id',
          as: 'fees'
        }
      },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          niveau: 1,
          category: 1,
          payments: {
            $map: {
              input: '$payments',
              as: 'payment',
              in: {
                amount: '$$payment.amountPaid',
                date: '$$payment.createdAt',
                status: '$$payment.status',
                period: '$$payment.period',
                fees: {
                  $map: {
                    input: {
                      $filter: {
                        input: '$fees',
                        as: 'fee',
                        cond: { $in: ['$$fee._id', '$$payment.feeId'] }
                      }
                    },
                    as: 'fee',
                    in: {
                      name: '$$fee.name',
                      type: '$$fee.type',
                      amount: '$$fee.amount',
                      description: '$$fee.description',
                      frequency: '$$fee.frequency'
                    }
                  }
                }
              }
            }
          }
        }
      }
    ]);
  }
} 