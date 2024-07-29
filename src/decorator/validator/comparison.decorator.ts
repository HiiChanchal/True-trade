import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function LessThan(from: string, validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'LessThan',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [from],
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    let _fromValue = args.object[args.constraints[0]];
                    return value < _fromValue;
                },
            },
        });
    };
}
export function LessThanEqualTo(from: string, validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'LessThanEqualTo',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [from],
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    let _fromValue = args.object[args.constraints[0]];
                    return value <= _fromValue;
                },
            },
        });
    };
}
export function GreaterThan(from: string, validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'GreaterThan',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [from],
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    let _fromValue = args.object[args.constraints[0]];
                    return value > _fromValue;
                },
            },
        });
    };
}
export function GreaterThanEqualTo(from: string, validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'GreaterThanEqualTo',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [from],
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    let _fromValue = args.object[args.constraints[0]];
                    return value >= _fromValue;
                },
            },
        });
    };
}
export function EqualTo(from: string, validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'EqualTo',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [from],
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    let _fromValue = args.object[args.constraints[0]];
                    return value == _fromValue;
                },
            },
        });
    };
}
export function EqualToIf(from: string, to: string, toEqualTo: any, validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'EqualToIf',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [from, to, toEqualTo],
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    let _fromValue = args.object[args.constraints[0]];
                    if (args.object[args.constraints[1]] == args.constraints[2])
                        return value == _fromValue;
                    else
                        return true;
                },
            },
        });
    };
}