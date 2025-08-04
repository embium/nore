import type { ModelHelpers } from '../core/base';
import OpenAICompatible from './openai-compatible';

const helpers: ModelHelpers = {
  isModelSupportVision: (model: string) => {
    const modelLower = model.toLowerCase();
    return modelLower.includes('vision') || modelLower.includes('llava');
  },
  isModelSupportToolUse: (model: string) => {
    return false;
  },
};

interface Options {
  lmStudioHost: string;
  lmStudioModel: string;
  temperature?: number;
  topP?: number;
}

export default class LMStudio extends OpenAICompatible {
  public name = 'LM Studio';
  public static helpers = helpers;

  constructor(public options: Options) {
    super({
      apiKey: '',
      apiHost: normalizeApiHost(options.lmStudioHost),
      model: options.lmStudioModel,
      temperature: options.temperature,
      topP: options.topP,
    });
  }

  isSupportToolUse() {
    return helpers.isModelSupportToolUse(this.options.lmStudioModel);
  }
}

function normalizeApiHost(apiHost: string) {
  let apiHostUrl = apiHost;
  if (apiHost) {
    apiHostUrl = apiHost.trim();
  }
  if (!apiHostUrl.startsWith('http')) {
    apiHostUrl = `http://${apiHostUrl}`;
  }
  if (apiHostUrl.endsWith('/')) {
    apiHostUrl = apiHostUrl.slice(0, -1);
  }
  if (!apiHostUrl.endsWith('/v1')) {
    apiHostUrl += '/v1';
  }
  return apiHostUrl;
}
