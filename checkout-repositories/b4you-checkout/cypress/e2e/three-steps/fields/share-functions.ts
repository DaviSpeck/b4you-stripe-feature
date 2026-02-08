import { genericsValues } from "../../share-functions";
import {
  BtnFirstStepSubmitClick,
  BtnSecondStepSubmitClick,
} from "../share-functions";

export function FirstStep() {
  genericsValues.userInfo.name();
  genericsValues.userInfo.email();
  genericsValues.userInfo.phone();
  BtnFirstStepSubmitClick();
}

export function SecondStep() {
  genericsValues.addressInfo.zipcode();
  genericsValues.addressInfo.street();
  genericsValues.addressInfo.neighborhood();
  genericsValues.addressInfo.addressNumber();
  BtnSecondStepSubmitClick();
}
