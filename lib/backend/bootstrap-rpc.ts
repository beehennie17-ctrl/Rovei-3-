export type BootstrapStudioRpcArgs = {
  p_name: string;
  p_timezone: string;
  p_theme: string;
  p_primary_colour: string;
  p_custom_primary: string;
  p_experience_modules: string[];
  p_services: {
    name: string;
    category: string;
    sort_order: number;
  }[];
};

type RpcResponse = {
  data: unknown;
  error: { message: string } | null;
};

export async function executeBootstrapStudioRpc(
  rpc: (args: BootstrapStudioRpcArgs) => PromiseLike<RpcResponse>,
  args: BootstrapStudioRpcArgs,
) {
  const { data, error } = await rpc(args);

  if (error) {
    throw new Error(error.message);
  }

  const result = Array.isArray(data) ? data[0] : data;

  if (
    !result ||
    typeof result !== "object" ||
    !("studio_id" in result) ||
    typeof result.studio_id !== "string" ||
    !("already_exists" in result) ||
    typeof result.already_exists !== "boolean"
  ) {
    throw new Error("The Studio bootstrap operation returned an invalid result.");
  }

  return {
    studioId: result.studio_id,
    alreadyExists: result.already_exists,
  };
}
