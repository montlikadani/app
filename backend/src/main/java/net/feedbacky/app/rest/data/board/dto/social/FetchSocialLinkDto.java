package net.feedbacky.app.rest.data.board.dto.social;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * @author Plajer
 * <p>
 * Created at 23.12.2019
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@JsonIgnoreProperties(ignoreUnknown = true)
public class FetchSocialLinkDto {

  private long id;
  private String logoUrl;
  private String url;

}
