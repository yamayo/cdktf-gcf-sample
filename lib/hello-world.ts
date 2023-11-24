import { Cloudfunctions2Function } from '@cdktf/provider-google/lib/cloudfunctions2-function'
import { ProjectIamMember } from '@cdktf/provider-google/lib/project-iam-member'
import { ServiceAccount } from '@cdktf/provider-google/lib/service-account'
import { StorageBucket } from '@cdktf/provider-google/lib/storage-bucket'
import { ITerraformDependable, TerraformOutput } from 'cdktf'
import { Construct } from 'constructs'
import { Environment } from '../main'
import { CloudFunctionsUploader } from './cloud-functions-uploader'

interface HelloWorldProps {
  env: Environment
  gcfUploadsBucket: StorageBucket
  dependsOn?: ITerraformDependable[]
}

export class HelloWorldResources extends Construct {
  constructor(scope: Construct, id: string, props: HelloWorldProps) {
    super(scope, id)

    const gcfUploader = new CloudFunctionsUploader(
      this,
      'hello-world-uploader',
      {
        functionName: 'hello-world',
        uploadBucket: props.gcfUploadsBucket,
      },
    )

    const helloWorldSa = new ServiceAccount(this, 'hello-world-function-sa', {
      accountId: 'hello-world-func-sa',
      displayName: 'Hello World Cloud Functions service account',
    })

    new ProjectIamMember(
      this,
      'artifact-registry-reader-to-hello-world-function',
      {
        project: props.env.projectId,
        role: 'roles/artifactregistry.reader',
        member: helloWorldSa.member,
      },
    )

    const helloWorldFn = new Cloudfunctions2Function(
      this,
      'hello-world-function',
      {
        name: `hello-world-${props.env.envName}`,
        location: props.env.defaultRegion,
        buildConfig: {
          entryPoint: 'main',
          runtime: 'nodejs18',
          source: {
            storageSource: {
              bucket: props.gcfUploadsBucket.name,
              object: gcfUploader.uploadObject.name,
            },
          },
        },
        serviceConfig: {
          maxInstanceCount: 1,
          availableMemory: '256M',
          timeoutSeconds: 60,
          serviceAccountEmail: helloWorldSa.email,
        },
        dependsOn: props.dependsOn,
      },
    )

    new TerraformOutput(this, 'hello-world-function-uri', {
      value: helloWorldFn.serviceConfig.uri,
    })
  }
}
