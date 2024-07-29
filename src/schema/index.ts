import { AdminModel } from "./admin.schema";
import { AuthModel } from "./auth.schema";
import { AvatarModel } from "./avatar.schema";
import { CategoryModel } from "./category.schema";
import { CommunicationModel } from "./communication.schema";
import { InquiryModel } from "./inquiry.schema";
import { LoginModel } from "./login.schema";
import { MyTradeModel } from "./my-trade.schema";
import { NotificationModel } from "./notification.schema";
import { PaymentMethodModel } from "./payment-method.schema";
import { SignalCommentViewModel } from "./signal-comment-view.schema";
import { SignalModel } from "./signal.schema";
import { SiteContentModel } from "./site-content.schema";
import { SubscriptionPlanModel } from "./subscription-plan.schema";
import { SubscriptionModel } from "./subscription.schema";
import { SupportCategoryModel } from "./support-category.schema";
import { TempAuthModel } from "./temp-auth.schema";
import { TransactionModel } from "./transaction.schema";
import { UserModel } from "./user.schema";

export const ADMIN_SCHEMA = { schema: AdminModel.schema, name: AdminModel.name };
export const AVATAR_SCHEMA = { schema: AvatarModel.schema, name: AvatarModel.name };
export const AUTH_SCHEMA = { schema: AuthModel.schema, name: AuthModel.name };
export const TEMP_AUTH_SCHEMA = { schema: TempAuthModel.schema, name: TempAuthModel.name };
export const INQUIRY_SCHEMA = { schema: InquiryModel.schema, name: InquiryModel.name };
export const LOGIN_SCHEMA = { schema: LoginModel.schema, name: LoginModel.name };
export const PAYMENT_METHOD_SCHEMA = { schema: PaymentMethodModel.schema, name: PaymentMethodModel.name };
export const SIGNAL_SCHEMA = { schema: SignalModel.schema, name: SignalModel.name };
export const SITE_CONTENT_SCHEMA = { schema: SiteContentModel.schema, name: SiteContentModel.name };
export const SUBSCRIPTION_PLAN_SCHEMA = { schema: SubscriptionPlanModel.schema, name: SubscriptionPlanModel.name };
export const SUBSCRIPTION_SCHEMA = { schema: SubscriptionModel.schema, name: SubscriptionModel.name };
export const TRANSACTION_SCHEMA = { schema: TransactionModel.schema, name: TransactionModel.name };
export const USER_SCHEMA = { schema: UserModel.schema, name: UserModel.name };
export const CATEGORY_SCHEMA = { schema: CategoryModel.schema, name: CategoryModel.name };
export const SUPPORT_CATEGORY_SCHEMA = { schema: SupportCategoryModel.schema, name: SupportCategoryModel.name };
export const COMMUNICATION_SCHEMA = { schema: CommunicationModel.schema, name: CommunicationModel.name };
export const NOTIFICATION_SCHEMA = { schema: NotificationModel.schema, name: NotificationModel.name };
export const MY_TRADE_SCHEMA = { schema: MyTradeModel.schema, name: MyTradeModel.name };
export const SIGNAL_COMMENT_VIEW_SCHEMA = { schema: SignalCommentViewModel.schema, name: SignalCommentViewModel.name };

export const ALL_SCHEMA = [
    ADMIN_SCHEMA,
    AVATAR_SCHEMA,
    AUTH_SCHEMA,
    TEMP_AUTH_SCHEMA,
    INQUIRY_SCHEMA,
    LOGIN_SCHEMA,
    PAYMENT_METHOD_SCHEMA,
    SIGNAL_SCHEMA,
    SITE_CONTENT_SCHEMA,
    SUBSCRIPTION_PLAN_SCHEMA,
    SUBSCRIPTION_SCHEMA,
    TRANSACTION_SCHEMA,
    USER_SCHEMA,
    CATEGORY_SCHEMA,
    SUPPORT_CATEGORY_SCHEMA,
    COMMUNICATION_SCHEMA,
    NOTIFICATION_SCHEMA,
    MY_TRADE_SCHEMA,
    SIGNAL_COMMENT_VIEW_SCHEMA
]