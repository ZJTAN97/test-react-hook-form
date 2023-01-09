import { FieldValues, Path, useFormContext, PathValue } from "react-hook-form";
import { SourceType } from "../../../../../../model/common/Source";
import { getExistingReference } from "./utils";

/**
 * Updates the respective Reference values in the Form based on provided field
 * @param {UseFormReturn<any, any>} formMethods React Hook Form Methods from useForm Hooks
 * @param { Path<T> } field  Keys within the form generated by React Hook form, specifies which field's references to update
 * @param { number | undefined } arrayId if selected field is array, have to specify its array Id
 * @param { SourceType } source Source Value provided
 */
export const useUpdateReferences = <T extends FieldValues>() => {
  const formMethods = useFormContext<T>();

  const updateReference = ({
    source,
    field,
    arrayId,
    sourceId,
  }: {
    source: SourceType;
    field: Path<T>;
    arrayId?: number;
    sourceId?: number;
  }) => {
    const existingReference = getExistingReference({
      formMethodValue: formMethods.getValues(),
      field,
      arrayId,
    }).filteredReference;

    const isObject = field === "rank" || field === "position";
    const isArrayObject =
      (field === "issuedBy" || field === "name") && arrayId !== undefined;
    const isArrayString =
      field === "skills" && existingReference && arrayId !== undefined;

    const updateExistingSources = () => {
      if (existingReference) {
        const isAddSource =
          source.referenceType !== undefined && sourceId === undefined;
        const isUpdateSource =
          source.referenceType !== undefined && sourceId !== undefined;
        const isDeleteSource =
          source.referenceType === undefined && sourceId !== undefined;

        if (isAddSource) {
          // add new
          existingReference.sources.push(source);
        } else if (isUpdateSource) {
          // update
          existingReference.sources[sourceId] = source;
        } else if (isDeleteSource) {
          // delete
          existingReference.sources.splice(sourceId, 1);
        }
      }
    };

    // Handle Object Type
    if (isObject) {
      if (existingReference) {
        const referenceIndexToReplace = formMethods
          .getValues()
          .appointment.references.indexOf(existingReference);
        updateExistingSources();
        if (existingReference.sources.length === 0) {
          formMethods
            .getValues()
            .appointment.references.splice(referenceIndexToReplace, 1);
        } else {
          formMethods.getValues().appointment.references[
            referenceIndexToReplace
          ] = existingReference;
        }
      } else {
        formMethods.setValue(
          "appointment.references" as Path<T>,
          [
            ...formMethods.getValues().appointment.references,
            {
              field,
              content: "",
              sources: [source],
            },
          ] as PathValue<T, Path<T>>,
        );
      }
    }
    // Handle Array String Type
    // Note that for Array String Types,
    // empty sources references are created/removed automatically
    // Refer to StringArrayInput.tsx for implementation
    else if (isArrayString) {
      const referenceIndexToReplace = formMethods
        .getValues()
        .references.indexOf(existingReference);
      updateExistingSources();
      formMethods.getValues().references[referenceIndexToReplace] =
        existingReference;
    }
    // Handle Array Object Type
    else if (isArrayObject) {
      const selectedObject = formMethods.getValues().certsToField[arrayId];
      if (existingReference) {
        const indexToReplace =
          selectedObject.references.indexOf(existingReference);
        updateExistingSources();
        selectedObject.references[indexToReplace] = existingReference;
      } else {
        selectedObject.references.push({
          field,
          content: "",
          sources: [source],
        });
      }
      let existingArrayObjects = [...formMethods.getValues().certsToField];
      existingArrayObjects[arrayId] = selectedObject;
      formMethods.setValue(
        "certsToField" as Path<T>,
        existingArrayObjects as PathValue<T, Path<T>>,
      );
    }
    // Handle String Type
    else {
      if (existingReference) {
        const indexToReplace = formMethods
          .getValues()
          .references.indexOf(existingReference);
        updateExistingSources();
        formMethods.getValues().references[indexToReplace] = existingReference;
      } else {
        formMethods.setValue(
          "references" as Path<T>,
          [
            ...formMethods.getValues().references,
            {
              field,
              content: "",
              sources: [source],
            },
          ] as PathValue<T, Path<T>>,
        );
      }
    }
  };

  return {
    updateReference,
  };
};
