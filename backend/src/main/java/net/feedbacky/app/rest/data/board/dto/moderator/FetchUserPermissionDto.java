package net.feedbacky.app.rest.data.board.dto.moderator;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import net.feedbacky.app.rest.data.board.moderator.Moderator;

/**
 * @author Plajer
 * <p>
 * Created at 02.11.2019
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class FetchUserPermissionDto {

  private String boardDiscriminator;
  private String boardName;
  private Moderator.Role role;

}
