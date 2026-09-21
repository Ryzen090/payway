import { Prop, Schema, SchemaOptions } from '@nestjs/mongoose';

export const BaseSchema: SchemaOptions = {
  versionKey: false,
  toJSON: {
    virtuals: true,
    transform: function (doc: any, ret: any) {
      delete ret.__v;
      return ret;
    },
  },
  toObject: {
    virtuals: true,
  },
  id: false,
  timestamps: {
    createdAt: 'dateCreated',
    updatedAt: 'dateUpdated',
  },
};

export const NonSchema: SchemaOptions = {
  versionKey: false,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
  id: false,
  _id: false,
  timestamps: false,
};

@Schema(BaseSchema)
export class BaseDeletableSchema {
  _id: string;

  @Prop({ type: Date, require: false })
  deletedAt: Date;

  @Prop({ type: Boolean, require: false, default: false })
  isDeleted: boolean;
}
