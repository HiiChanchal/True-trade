import { Injectable } from "@nestjs/common";
import Stripe from 'stripe';
import { AppConfigService } from "./config.service";
import { StripeCustomerDto } from "src/dto/stripe.dto";

@Injectable()
export class StripeService {
    stripe: Stripe;
    constructor(private appConfigService: AppConfigService) {
        this.stripe = new Stripe(this.appConfigService.stripeSecretKey);
    }

    async createCustomer(customerDto: StripeCustomerDto) {
        return await this.stripe.customers.create(customerDto);
    }
    async createAccount(customerDto: StripeCustomerDto) {
        return await this.stripe.accounts.create({
            type: 'custom',
            email: customerDto.email,
            capabilities: {
                transfers: {
                    requested: true,
                },
            }
        });
    }
    async createSession(accountId: any) {
        return await this.stripe.financialConnections.sessions.create({
            account_holder: {
                type: 'account',
                account: accountId,
            },
            permissions: ['balances', 'ownership', 'payment_method', 'transactions']
        })
    }
    async charge(amount: number, paymentMethodId: string, customerId: string) {
        return this.stripe.paymentIntents.create({
            amount: amount,
            customer: customerId,
            payment_method: paymentMethodId,
            currency: 'usd',
            confirm: true,
            payment_method_types: ['card']
        })
    }
    async constructEvent(signature: string, body: any) {
        return this.stripe.webhooks.constructEvent(body, signature, this.appConfigService.stripeWebhookSecret);
    }
}