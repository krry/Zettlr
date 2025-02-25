/**
 * @ignore
 * BEGIN HEADER
 *
 * Contains:        Advanced Preferences Schema
 * CVM-Role:        Model
 * Maintainer:      Hendrik Erz
 * License:         GNU GPL v3
 *
 * Description:     Exports the advanced tab schema.
 *
 * END HEADER
 */

import { trans } from '../../common/i18n-renderer'

export default function () {
  return {
    fieldsets: [
      [
        {
          type: 'text',
          label: trans('dialog.preferences.filename_generator'),
          model: 'newFileNamePattern',
          info: 'Variables: %id, %Y, %y, %M, %D, %W, %h, %m, %s, %X, %uuid4'
        },
        {
          type: 'checkbox',
          label: trans('dialog.preferences.new_file_dont_prompt'),
          model: 'newFileDontPrompt'
        }
      ],
      [
        {
          type: 'checkbox',
          label: trans('dialog.preferences.debug'),
          model: 'debug'
        },
        {
          type: 'checkbox',
          label: trans('dialog.preferences.checkForBeta'),
          model: 'checkForBeta'
        },
        {
          type: 'checkbox',
          label: trans('dialog.preferences.use_native_appearance'),
          model: 'window.nativeAppearance'
        },
        {
          type: 'checkbox',
          label: trans('dialog.preferences.delete_on_fail'),
          model: 'system.deleteOnFail'
        }
      ],
      [
        {
          type: 'token',
          label: trans('dialog.preferences.attachments_info'),
          model: 'attachmentExtensions'
        },
        {
          type: 'list',
          label: trans('dialog.preferences.whitelist'),
          model: 'system.iframeWhitelist',
          deletable: true,
          labels: ['Hostname'], // TODO: Translate!
          searchable: true,
          searchLabel: 'Search for entries …'
        }
      ],
      [
        {
          type: 'checkbox',
          label: trans('dialog.preferences.watchdog_checkbox_label'),
          model: 'watchdog.activatePolling'
        },
        {
          type: 'number',
          label: trans('dialog.preferences.watchdog_threshold_label'),
          model: 'watchdog.stabilityThreshold'
        }
      ]
    ]
  }
}
