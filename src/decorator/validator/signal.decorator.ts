import { ValidationArguments, ValidationOptions, registerDecorator } from "class-validator";
import { SignalTypeEnum } from "src/enum/signal.enum";

export function SignalStopLoss(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'SignalStopLoss',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [],
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const _obj: any = args.object;
                    if (_obj.type == SignalTypeEnum.BUY) {
                        return value < _obj.entry;
                    }
                    else {
                        return value > _obj.entry;
                    }
                },
                defaultMessage(args: ValidationArguments) {
                    const _obj: any = args.object;
                    if (_obj.type == SignalTypeEnum.BUY) {
                        return 'Stoploss should be less than entry price.';
                    }
                    else {
                        return 'Stoploss should be greater than entry price.';
                    }
                }
            }
        });
    };
}
export function SignalTarget(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'SignalTarget',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [],
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const _obj: any = args.object;
                    if (_obj.type == SignalTypeEnum.BUY) {
                        return value > _obj.entry;
                    }
                    else {
                        return value < _obj.entry;
                    }
                },
                defaultMessage(args: ValidationArguments) {
                    const _obj: any = args.object;
                    if (_obj.type == SignalTypeEnum.BUY) {
                        return 'Target should be greater than entry price.';
                    }
                    else {
                        return 'Target should be less than entry price.';
                    }
                }
            },
        });
    };
}