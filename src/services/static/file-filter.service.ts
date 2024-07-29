import { BadRequestException, Injectable } from "@nestjs/common";
import { diskStorage } from "multer";
import { UtilityService } from "./utility.service";
import { extname } from "path";

@Injectable()
export class FileFilterService {
    static imageFilter(folder: string) {
        let options: any = {
            fileFilter: (req: any, file: any, cb: any) => {
                if (!file.originalname.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/)) {
                    return cb(new Error('Only .jpg, .jpeg, .png, .gif,.webp images are allowed'), false);
                }
                cb(null, true);
            },
            storage: diskStorage({
                destination: `./public/${folder}`,
                filename: (req, file, cb) => {
                    return cb(null, `${UtilityService.guid()}${extname(file.originalname)}`)
                }
            })
        };
        return options
    }
}