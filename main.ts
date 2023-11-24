import { ArchiveProvider } from '@cdktf/provider-archive/lib/provider'
import { GoogleProvider } from '@cdktf/provider-google/lib/provider'
import { StorageBucket } from '@cdktf/provider-google/lib/storage-bucket'
import { App, GcsBackend, TerraformHclModule, TerraformStack } from 'cdktf'
import { Construct } from 'constructs'
import config from './config'
import { HelloWorldResources } from './lib/hello-world'

export interface Environment {
  envName: string
  projectId: string
  projectNumber: string
  systemName: string
  defaultRegion: string
}

export class CdktfGcfSampleStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id)

    const env: Environment = {
      envName: config.ENV_NAME,
      projectId: config.PROJECT_ID,
      projectNumber: config.PROJECT_NUMBER,
      systemName: 'cdktf-gcf-sample',
      defaultRegion: 'asia-northeast1',
    }

    new GoogleProvider(this, 'google-provider', {
      project: env.projectId,
      region: env.defaultRegion,
    })
    new ArchiveProvider(this, 'archive-provider')

    new GcsBackend(this, {
      bucket: config.TF_STATE_BUCKET,
    })

    const enableApis = new TerraformHclModule(this, 'enable-apis', {
      source:
        'terraform-google-modules/project-factory/google//modules/project_services',
      variables: {
        disable_services_on_destroy: true,
        project_id: env.projectId,
        enable_apis: true,
        activate_apis: [
          'artifactregistry.googleapis.com',
          'cloudbuild.googleapis.com',
          'cloudfunctions.googleapis.com',
          'logging.googleapis.com',
          'pubsub.googleapis.com',
          'run.googleapis.com',
        ],
      },
    })

    // Cloud Functions Uploads Bucket
    const gcfUploadsBucket = new StorageBucket(this, 'gcf-uploads-bucket', {
      name: `gcf-v2-uploads-${env.projectNumber}-${env.defaultRegion}`,
      location: env.defaultRegion,
      uniformBucketLevelAccess: true,
    })

    new HelloWorldResources(this, 'hello-world', {
      env,
      gcfUploadsBucket,
      dependsOn: [enableApis],
    })
  }
}

const app = new App()
new CdktfGcfSampleStack(app, 'cdktf-gcf-sample')
app.synth()
