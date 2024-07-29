import { ValidationArguments, ValidationOptions, registerDecorator } from "class-validator";
import { NO_WHITE_SPACE } from "src/regex";

export function NoWhiteSpace(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'NoWhiteSpace',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [],
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    return !NO_WHITE_SPACE.test(value);
                },
            },
        });
    };
}