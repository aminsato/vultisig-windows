
import ExpoModulesCore
import Tss

public class MobileTssModule: Module {
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  public func definition() -> ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('MobileTss')` in JavaScript.
    Name("MobileTss")

    // Defines event names that the module can send to JavaScript.
    Events("onProgress","onError")

    // Defines a JavaScript synchronous function that runs the native code on the JavaScript thread.
    Function("getDerivedPublicKey") { (hexPublicKey: String,hexChainCode: String, derivePath: String) in
        return PublicKeyHelper.getDerivedPubKey(hexPubKey: hexPublicKey, hexChainCode: hexChainCode, derivePath: derivePath)
    }

    // Defines a JavaScript function that always returns a Promise and whose native code
    // is by default dispatched on the different thread than the JavaScript runtime runs on.
    AsyncFunction("keygen") { (name: String) in
      
    }
  }
}
