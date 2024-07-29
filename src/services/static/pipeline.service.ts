import { Injectable } from "@nestjs/common";
import { PipelineStage } from "mongoose";
import { SortOrderEnum } from "src/enum/common.enum";

@Injectable()
export class PipelineService {
    static match(_match: any): PipelineStage.Match {
        return { $match: _match };
    }
    static sort(field: string, order: string): PipelineStage.Sort {
        let _sort: any = {};
        _sort[field] = order == SortOrderEnum.ASCENDING ? 1 : -1;
        return { $sort: _sort };
    }
    static skip(page: number, limit: number): PipelineStage.Skip {
        return { $skip: (page - 1) * limit };
    }
    static limit(limit: number): PipelineStage.Limit {
        return { $limit: limit };
    }
    static unwind(path: string, preserveNullAndEmptyArrays: boolean = true): PipelineStage.Unwind {
        return { $unwind: { path: `$${path}`, preserveNullAndEmptyArrays: preserveNullAndEmptyArrays } };
    }
    static lookup(from: string, localField: string, foreignField: string, as: string, pipeline: Exclude<PipelineStage, PipelineStage.Merge | PipelineStage.Out>[]): PipelineStage.Lookup {
        return {
            $lookup: {
                from: from,
                localField: localField,
                foreignField: foreignField,
                pipeline: pipeline,
                as: as
            }
        };
    }
    static lookupWithLet(from: string, customlet: any, as: string, pipeline: Exclude<PipelineStage, PipelineStage.Merge | PipelineStage.Out>[]): PipelineStage.Lookup {
        return {
            $lookup: {
                from: from,
                let: customlet,
                pipeline: pipeline,
                as: as
            }
        };
    }
    static project(project: any): PipelineStage.Project {
        return {
            $project: { ...project }
        };
    }
    static group(group: any): PipelineStage.Group {
        return { $group: { ...group } };
    }
    static count(array: any): PipelineStage.Count {
        return { $count: { ...array } }
    }
    static field(field: string, expression: any): PipelineStage.AddFields {
        let _addField: any = {};
        _addField[field] = expression;
        return { $addFields: _addField };
    }
    static file(folder: string, key: any) {
        return {
            $cond: {
                if: { $eq: [{ $ifNull: [key, ""] }, ""] },
                then: null,
                else: { $concat: [process.env.DOC_BASE_URL, `${folder}/`, key] }
            }
        };
    }

    static condition(condition: any, successCase: any, failCase: any) {
        return {
            $cond: {
                if: condition,
                then: successCase,
                else: failCase
            }
        };
    }
    static average(total: any, number: any, round: number) {
        return {
            $round: [{ $divide: [total, this.condition({ $eq: [number, 0] }, 1, number)] }, round]
        };
    }

}