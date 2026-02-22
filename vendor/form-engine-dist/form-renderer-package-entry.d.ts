import React from 'react';
import { LucideIcon } from 'lucide-react';
import { UseFormRegisterReturn, UseFormSetValue } from 'react-hook-form';

type DeviceType = 'desktop' | 'tablet' | 'mobile';
interface SelectOption {
    label: string;
    value: string;
    description?: string;
    id?: string;
    [key: string]: any;
}
type ElementType = 'text' | 'number' | 'email' | 'phone' | 'password' | 'url' | 'location' | 'textarea' | 'wysiwyg' | 'signature' | 'checkbox' | 'checkbox-group' | 'checkbox-blocks' | 'checkbox-tabs' | 'radio' | 'radio-group' | 'radio-blocks' | 'radio-tabs' | 'matrix' | 'matrix-table' | 'toggle' | 'select' | 'multiselect' | 'top-of-mind' | 'tags' | 'date' | 'datetime' | 'time' | 'multiple-dates' | 'date-range' | 'slider' | 'range-slider' | 'vertical-slider' | 'file-upload' | 'multi-file-upload' | 'image-upload' | 'multi-image-upload' | 'gallery' | 'captcha' | 'hidden' | 'button' | 'submit-button' | 'reset-button' | 'primary-button' | 'secondary-button' | 'danger-button' | 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'quote' | 'image' | 'link' | 'divider' | 'static-html' | 'tabs' | 'tab' | 'steps' | 'step' | 'container' | 'two-columns' | 'three-columns' | 'four-columns' | 'grid' | 'layout-table' | 'list' | 'banner';
interface FormElement {
    id: string;
    type: ElementType;
    children?: FormElement[];
    showPrevious?: boolean;
    showNext?: boolean;
    previousLabel?: string;
    nextLabel?: string;
    finishLabel?: string;
    showStepsBar?: boolean;
    stepsBarMode?: 'full' | 'compact';
    isLastStep?: boolean;
    activeStepIndex?: number;
    activeTabIndex?: number;
    label?: string;
    placeholder?: string;
    description?: string;
    required?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    name?: string;
    colSpan?: number;
    options?: SelectOption[];
    submitData?: boolean;
    value?: any;
    initialInstances?: number;
    listMin?: number;
    listMax?: number;
    listCanAdd?: boolean;
    listCanRemove?: boolean;
    listCanSort?: boolean;
    listAddText?: string;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    inputType?: 'text' | 'password' | 'email' | 'number' | 'url' | 'tel' | 'textarea' | 'location';
    tooltip?: string;
    autoFloat?: 'default' | 'off' | 'on';
    unmaskValue?: boolean;
    includeCountries?: string[];
    excludeCountries?: string[];
    defaultCountry?: string;
    rows?: number;
    autoGrow?: boolean;
    checkboxLabel?: string;
    trueValue?: string;
    falseValue?: string;
    selectedByDefault?: boolean;
    mustBeAccepted?: boolean;
    radioText?: string;
    radioName?: string;
    radioValue?: string;
    view?: 'default' | 'tabs' | 'blocks';
    minItems?: number;
    maxItems?: number;
    exactItems?: number;
    toggleText?: string;
    toggleOnLabel?: string;
    toggleOffLabel?: string;
    native?: boolean;
    search?: boolean;
    strictSearch?: boolean;
    trackByKey?: string;
    inputTypeSelect?: string;
    autocompleteSelect?: string;
    allowNewOption?: boolean;
    allowCustomValue?: boolean;
    appendNewOption?: boolean;
    addOn?: string[];
    canDeselect?: boolean;
    canClear?: boolean;
    closeOnSelect?: boolean;
    hideSelected?: boolean;
    displayCaret?: boolean;
    truncate?: boolean;
    openDirection?: 'top' | 'bottom';
    optionLimit?: number;
    maxOptions?: number;
    optionsLabelOne?: string;
    optionsLabelMulti?: string;
    noOptionsText?: string;
    noResultsText?: string;
    dateFormatDisplay?: string;
    dateFormatValue?: string;
    dateFormatLoad?: string;
    minDate?: string;
    maxDate?: string;
    disabledDates?: string;
    timeFormat24?: boolean;
    timeSeconds?: boolean;
    dateMode?: 'single' | 'multiple' | 'range';
    matrixRows?: Array<{
        text: string;
        value: string;
    }>;
    matrixColumns?: Array<{
        text: string;
        value: string;
        type?: string;
        width?: string;
    }>;
    matrixVariant?: 'radio' | 'text';
    showLine?: boolean;
    canvasHeight?: number;
    canvasMaxWidth?: string;
    imageWidth?: number;
    imageHeight?: number;
    penColor?: string;
    backgroundColor?: string;
    invertColors?: boolean;
    canUndo?: boolean;
    canDrop?: boolean;
    hideTools?: boolean;
    fileAutoUpload?: boolean;
    fileDragAndDrop?: boolean;
    fileSoftRemove?: boolean;
    fileClickable?: boolean;
    fileClickUrl?: string;
    filePreviewUrl?: string;
    fileCanAdd?: boolean;
    fileCanRemove?: boolean;
    fileCanSort?: boolean;
    fileStoreValueInObject?: boolean;
    fileAcceptTypes?: string[];
    fileMimeTypes?: string[];
    fileExtensions?: string[];
    fileUploadTempEndpoint?: string;
    fileRemoveTempEndpoint?: string;
    fileRemoveEndpoint?: string;
    fileMinSize?: number;
    fileMaxSize?: number;
    fileExactSize?: number;
    fileImageWidth?: number;
    fileImageHeight?: number;
    fileImageMinWidth?: number;
    fileImageMinHeight?: number;
    fileImageMaxWidth?: number;
    fileImageMaxHeight?: number;
    fileImageRatio?: string;
    sliderMin?: number;
    sliderMax?: number;
    sliderStep?: number;
    sliderOrientation?: 'horizontal' | 'vertical';
    sliderDirection?: 'ltr' | 'rtl';
    sliderTooltips?: boolean;
    sliderShowTooltips?: 'always' | 'focus' | 'drag';
    sliderTooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
    sliderMergeTooltips?: boolean;
    sliderFormatPrefix?: string;
    sliderFormatSuffix?: string;
    sliderFormatDecimals?: number;
    sliderFormatThousand?: string;
    meta?: boolean;
    content?: string;
    href?: string;
    target?: string;
    src?: string;
    alt?: string;
    width?: string;
    height?: string;
    html?: string;
    imageSource?: 'url' | 'upload' | 'unsplash';
    objectFit?: 'cover' | 'contain' | 'fill';
    aspectRatio?: 'auto' | '16/9' | '4/3' | '1/1';
    borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
    containerStyle?: 'simple' | 'card' | 'paper';
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    textColor?: string;
    defaultValue?: string | number[] | string[];
    useExpressionValue?: boolean;
    expression?: string;
    forceNumericValues?: boolean;
    prefix?: string;
    suffix?: string;
    before?: string;
    between?: string;
    after?: string;
    size?: 'default' | 'sm' | 'md' | 'lg';
    columnsMode?: 'default' | 'tablet' | 'desktop';
    defaultColumnWidths?: boolean;
    align?: 'left' | 'center' | 'right';
    fullWidth?: boolean;
    flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
    justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
    alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
    gap?: number;
    padding?: string;
    mobileColSpan?: number;
    tabletColSpan?: number;
    bannerHeight?: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
    bannerCustomHeight?: string;
    backgroundType?: 'color' | 'image' | 'video';
    videoUrl?: string;
    overlayColor?: string;
    overlayOpacity?: number;
    fieldName?: string;
    nullable?: boolean;
    unique?: boolean;
    exist?: boolean;
    exactLength?: number;
    minValue?: number;
    maxValue?: number;
    exactValue?: number;
    step?: number;
    regex?: string;
    patternMatchMode?: 'match' | 'not-match';
    mask?: string;
    completeOnly?: boolean;
    elementId?: string;
    autocomplete?: string;
    className?: string;
    autoFocus?: boolean;
    visibilityConditions?: ConditionGroup;
    requiredConditions?: ConditionGroup;
    visibilityExpression?: string;
    requiredExpression?: string;
    hasOther?: boolean;
    dataSourceType?: 'list' | 'json' | 'endpoint' | 'internal';
    dataSourceUrl?: string;
    dataSourceJson?: string;
    dataSourceValueKey?: string;
    dataSourceLabelKey?: string;
    dataSourceDescriptionKey?: string;
    dataSourceDataKey?: string;
    searchParam?: string;
    updateOptionsOnSearch?: boolean;
    useObjectValue?: boolean;
    internalDatasourceId?: string;
}
interface ConditionGroup {
    id: string;
    type: 'and' | 'or';
    conditions: Array<ConditionLine | ConditionGroup>;
}
interface ConditionLine {
    id: string;
    field: string;
    operator: 'empty' | 'not_empty' | 'equal' | 'not_equal' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'any_equal' | 'not_any_equal';
    value: any | any[];
}
interface FormConfig {
    name: string;
    previewWidth: number;
    useNesting: boolean;
    submission: {
        endpoint: string;
        method: 'POST' | 'GET' | 'PUT';
        addUniqueId: boolean;
    };
    validation: {
        live: boolean;
    };
    layout: {
        size: 'default' | 'sm' | 'md' | 'lg';
        forceLabels: boolean;
        floatPlaceholders: boolean;
        displayErrors: boolean;
        displayMessages: boolean;
    };
    scripts?: Array<{
        id: string;
        name: string;
        content: string;
        active?: boolean;
    }>;
}
interface ThemeConfig {
    cssVariables: Record<string, string>;
    radius: string;
    style?: FormStyle;
    welcomePage?: WelcomePageConfig;
    thankYouPage?: ThankYouPageConfig;
}
interface FormStyle {
    background?: {
        type: 'color' | 'image' | 'upload' | 'unsplash';
        value: string;
        opacity?: number;
        blur?: number;
    };
    containerColor?: string;
    fontFamily?: string;
    questionSpacing?: 'compact' | 'normal' | 'spacious';
    coverImage?: {
        enabled: boolean;
        type: 'upload' | 'unsplash';
        value: string;
        height: 'sm' | 'md' | 'lg';
        titleAlignment?: 'left' | 'center';
    };
    logo?: {
        enabled: boolean;
        url: string;
        size: 'sm' | 'md' | 'lg';
    };
}
interface WelcomePageConfig {
    enabled: boolean;
    title: string;
    description: string;
    buttonText: string;
    layout: 'centered' | 'cover' | 'split-left' | 'split-right';
    backgroundImage?: string;
    coverImage?: string;
    logo?: string;
    backgroundType?: 'color' | 'image';
    backgroundColor?: string;
    containerColor?: string;
    elements?: FormElement[];
}
interface ThankYouPageConfig {
    enabled: boolean;
    title: string;
    message: string;
    buttonText?: string;
    buttonUrl?: string;
    buttonAction: 'none' | 'link' | 'redirect';
    showConfetti: boolean;
    image?: string;
    backgroundType?: 'color' | 'image';
    backgroundColor?: string;
    containerColor?: string;
    elements?: FormElement[];
}
interface ToolItem {
    type: ElementType;
    label: string;
    description: string;
    icon: LucideIcon;
}
interface MasterSchema {
    elements: FormElement[];
    config?: FormConfig;
    theme?: ThemeConfig;
    welcomePage?: WelcomePageConfig;
    thankYouPage?: ThankYouPageConfig;
}

interface FormRendererProps {
    elements: FormElement[];
    onSubmit: (data: any) => void;
    isSubmitting?: boolean;
    config?: any;
    themeConfig?: any;
    customFunctions?: Record<string, Function>;
    onUpload?: (file: File) => Promise<string>;
    onChange?: (values: any) => void;
    initialValues?: any;
    initialStepIndex?: number;
    onStepChange?: (index: number) => void;
    welcomePage?: WelcomePageConfig;
    thankYouPage?: ThankYouPageConfig;
    viewDevice?: DeviceType;
    startState?: 'welcome' | 'form' | 'thank_you';
}
declare const FormRenderer: React.FC<FormRendererProps>;

interface ThemeProviderProps {
    themeConfig?: ThemeConfig;
    children: React.ReactNode;
}
declare const ThemeProvider: React.FC<ThemeProviderProps>;

interface FullPageRendererProps {
    formId: string;
    elements: FormElement[];
    config?: any;
    themeConfig?: ThemeConfig;
    welcomeConfig?: WelcomePageConfig;
    thankYouConfig?: ThankYouPageConfig;
    viewDevice?: any;
    onSubmit: (data: any) => Promise<void>;
}
declare function FullPageRenderer({ elements, config, themeConfig, welcomeConfig, thankYouConfig, viewDevice, onSubmit }: FullPageRendererProps): React.JSX.Element;

interface BaseSelectProps {
    label?: string;
    error?: string;
    description?: string;
    placeholder?: string;
    options: SelectOption[];
    value?: string | string[];
    onChange?: (value: string | string[]) => void;
    onSearchChange?: (query: string) => void;
    loading?: boolean;
    multiple?: boolean;
    disabled?: boolean;
    required?: boolean;
    canClear?: boolean;
    searchable?: boolean;
    noOptionsText?: string;
    noResultsText?: string;
    className?: string;
    strictSearch?: boolean;
    trackBy?: string;
    allowNewOption?: boolean;
    appendNewOption?: boolean;
    addOn?: string[];
    canDeselect?: boolean;
    closeOnSelect?: boolean;
    displayCaret?: boolean;
    truncate?: boolean;
    openDirection?: 'top' | 'bottom';
    optionLimit?: number;
    inputType?: string;
    autoComplete?: string;
    minSearchLength?: number;
    size?: 'default' | 'sm' | 'md' | 'lg';
}
declare const BaseSelect: React.FC<BaseSelectProps>;

interface CheckboxProps {
    label?: string;
    error?: string;
    description?: string;
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    required?: boolean;
    disabled?: boolean;
}
declare const Checkbox: React.ForwardRefExoticComponent<CheckboxProps & React.RefAttributes<HTMLInputElement>>;

interface CheckboxOption {
    label: string;
    value: string;
    description?: string;
}
interface CheckboxGroupProps {
    label?: string;
    error?: string;
    description?: string;
    options: CheckboxOption[];
    value?: string[];
    onValueChange?: (value: string[]) => void;
    required?: boolean;
    disabled?: boolean;
    name: string;
    direction?: 'vertical' | 'horizontal';
    view?: 'default' | 'blocks' | 'tabs';
}
declare const CheckboxGroup: React.FC<CheckboxGroupProps>;

interface DatePickerProps {
    label?: string;
    error?: string;
    description?: string;
    value?: string | string[];
    onChange?: (value: string | string[]) => void;
    required?: boolean;
    disabled?: boolean;
    name?: string;
    placeholder?: string;
    mode?: 'single' | 'multiple' | 'range';
    minDate?: string;
    maxDate?: string;
    dateFormatDisplay?: string;
}
declare const DatePicker: React.FC<DatePickerProps>;

interface FileUploadProps {
    element: FormElement;
    register: UseFormRegisterReturn;
    setValue: UseFormSetValue<any>;
    error?: string;
    onUpload?: (file: File) => Promise<string>;
    value?: string | string[];
    hideLabel?: boolean;
}
declare const FileUpload: React.FC<FileUploadProps>;

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    label?: string;
    error?: string;
    description?: string;
    prefix?: string;
    suffix?: string;
    before?: string;
    between?: string;
    after?: string;
    mask?: string;
    size?: 'default' | 'sm' | 'md' | 'lg';
}
declare const Input: React.ForwardRefExoticComponent<InputProps & React.RefAttributes<HTMLInputElement>>;

interface MatrixProps {
    label?: string;
    error?: string;
    description?: string;
    name: string;
    rows?: Array<{
        text: string;
        value: string;
    }>;
    columns?: Array<{
        text: string;
        value: string;
    }>;
    value?: any;
    onValueChange?: (value: any) => void;
    required?: boolean;
    variant?: 'radio' | 'text';
}
declare const Matrix: React.FC<MatrixProps>;

interface MultiSelectProps {
    label?: string;
    error?: string;
    description?: string;
    options: SelectOption[];
    value?: string[];
    onValueChange?: (value: string[]) => void;
    onSearchChange?: (query: string) => void;
    loading?: boolean;
    disabled?: boolean;
    required?: boolean;
    placeholder?: string;
    searchable?: boolean;
    canClear?: boolean;
    className?: string;
    name?: string;
    strictSearch?: boolean;
    trackBy?: string;
    allowNewOption?: boolean;
    appendNewOption?: boolean;
    addOn?: string[];
    canDeselect?: boolean;
    closeOnSelect?: boolean;
    displayCaret?: boolean;
    truncate?: boolean;
    openDirection?: 'top' | 'bottom';
    optionLimit?: number;
    inputType?: string;
    autoComplete?: string;
}
declare const MultiSelect: React.FC<MultiSelectProps>;

interface PhoneInputProps {
    value?: string;
    onChange?: (value: string) => void;
    onBlur?: () => void;
    name?: string;
    label?: string;
    description?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    placeholder?: string;
    defaultCountry?: string;
    size?: 'sm' | 'md' | 'lg' | 'default';
    unmaskValue?: boolean;
}
declare const COUNTRIES: {
    code: string;
    flag: string;
    label: string;
}[];
declare const PhoneInput: React.FC<PhoneInputProps>;

interface RadioOption {
    label: string;
    value: string;
    description?: string;
}
interface RadioGroupProps {
    label?: string;
    error?: string;
    description?: string;
    options: RadioOption[];
    value?: string;
    onValueChange?: (value: string) => void;
    required?: boolean;
    disabled?: boolean;
    name: string;
    view?: 'default' | 'blocks' | 'tabs';
    direction?: 'vertical' | 'horizontal';
}
declare const RadioGroup: React.FC<RadioGroupProps>;

interface RangeSliderProps {
    label?: string;
    error?: string;
    description?: string;
    min?: number;
    max?: number;
    step?: number;
    value?: number[];
    onValueChange?: (value: number[]) => void;
    required?: boolean;
    disabled?: boolean;
    name: string;
    showSteps?: boolean;
    sliderFormatPrefix?: string;
    sliderFormatSuffix?: string;
}
declare const RangeSlider: React.FC<RangeSliderProps>;

interface RichTextEditorProps {
    label?: string;
    error?: string;
    description?: string;
    value?: string;
    onChange?: (value: string) => void;
    name: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
}
declare const RichTextEditor: React.FC<RichTextEditorProps>;

interface SelectProps {
    label?: string;
    error?: string;
    description?: string;
    options: SelectOption[];
    value?: string;
    onChange?: (value: string) => void;
    onSearchChange?: (query: string) => void;
    loading?: boolean;
    disabled?: boolean;
    required?: boolean;
    placeholder?: string;
    searchable?: boolean;
    canClear?: boolean;
    className?: string;
    name?: string;
    strictSearch?: boolean;
    trackBy?: string;
    allowNewOption?: boolean;
    appendNewOption?: boolean;
    addOn?: string[];
    canDeselect?: boolean;
    closeOnSelect?: boolean;
    displayCaret?: boolean;
    truncate?: boolean;
    openDirection?: 'top' | 'bottom';
    optionLimit?: number;
    inputType?: string;
    autoComplete?: string;
}
declare const Select: React.ForwardRefExoticComponent<SelectProps & React.RefAttributes<HTMLDivElement>>;

interface SliderProps {
    label?: string;
    error?: string;
    description?: string;
    min?: number;
    max?: number;
    step?: number;
    value?: number;
    onValueChange?: (value: number) => void;
    required?: boolean;
    disabled?: boolean;
    name: string;
    orientation?: 'horizontal' | 'vertical';
}
declare const Slider: React.FC<SliderProps>;

interface SwitchProps {
    label?: string;
    description?: string;
    error?: string;
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    required?: boolean;
    disabled?: boolean;
    name?: string;
}
declare const Switch: React.FC<SwitchProps>;

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    description?: string;
    before?: string;
    between?: string;
    after?: string;
    size?: 'default' | 'sm' | 'md' | 'lg';
}
declare const TextArea: React.ForwardRefExoticComponent<TextAreaProps & React.RefAttributes<HTMLTextAreaElement>>;

interface TopOfMindFieldProps extends Omit<BaseSelectProps, 'options'> {
    options?: SelectOption[];
    allowCustomValue?: boolean;
    dataSourceType?: 'list' | 'json' | 'endpoint';
    dataSourceUrl?: string;
    dataSourceJson?: string;
    dataSourceValueKey?: string;
    dataSourceLabelKey?: string;
    dataSourceDescriptionKey?: string;
    dataSourceDataKey?: string;
    searchParam?: string;
    updateOptionsOnSearch?: boolean;
}
declare const TopOfMindField: React.FC<TopOfMindFieldProps>;

export { BaseSelect, type BaseSelectProps, COUNTRIES, Checkbox, CheckboxGroup, type CheckboxOption, type ConditionGroup, type ConditionLine, DatePicker, type DeviceType, type ElementType, FileUpload, type FormConfig, type FormElement, FormRenderer, type FormStyle, FullPageRenderer, Input, type MasterSchema, Matrix, MultiSelect, PhoneInput, RadioGroup, type RadioOption, RangeSlider, RichTextEditor, Select, type SelectOption, Slider, Switch, TextArea, type ThankYouPageConfig, type ThemeConfig, ThemeProvider, type ToolItem, TopOfMindField, type WelcomePageConfig };
